import React, { useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletError } from '@solana/wallet-adapter-base';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TokenType, StandardTokenForm, LiquidityTokenForm, Chain } from './types';
import { generateTokenContract } from './services/geminiService';
import { TREASURY_WALLET_ADDRESS } from './config';
import Header from './components/Header';
import Tabs from './components/Tabs';
import TokenForm from './components/TokenForm';
import CodeBlock from './components/CodeBlock';
import Footer from './components/Footer';
import { ChainSelector } from './components/ChainSelector';

type Prices = {
  standard: number;
  liquidity: number;
};

function App(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<TokenType>(TokenType.Standard);
  const [selectedChain, setSelectedChain] = useState<Chain>(Chain.Ethereum);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [tokenFormData, setTokenFormData] = useState<StandardTokenForm | LiquidityTokenForm | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Prices | null>(null);
  const [pricesError, setPricesError] = useState<string>('');
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  useEffect(() => {
    const fetchPrices = async () => {
        try {
            const response = await fetch('/api/get-prices');
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    // Try to parse as JSON to get a structured error message
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.error || `Server error: ${response.status}`);
                } catch (e) {
                    // If parsing fails, the error is not JSON; use the raw text.
                    throw new Error(errorText || `Failed to fetch prices. Status: ${response.status}`);
                }
            }
            const data = await response.json();
            if (data && typeof data.standard === 'number' && typeof data.liquidity === 'number') {
                setPrices(data);
            } else {
                throw new Error('Invalid price data received from server.');
            }
        } catch (err: any) {
            console.error("Price fetch error:", err);
            setPricesError(err.message || 'Could not load token generation fees.');
        }
    };
    fetchPrices();
  }, []);


  const handlePaymentAndGeneration = useCallback(async (formData: StandardTokenForm | LiquidityTokenForm) => {
    if (!connected || !publicKey || !sendTransaction) {
      const connectError = "Please connect your Solana wallet to proceed.";
      setError(connectError);
      setWalletError(connectError);
      return;
    }

    if (!prices) {
        setError("Token prices are not available at the moment. Please try again later.");
        return;
    }

    const feeInSol = activeTab === TokenType.Standard ? prices.standard : prices.liquidity;
    const feeInLamports = feeInSol * LAMPORTS_PER_SOL;

    setIsPaying(true);
    setError('');
    setWalletError(null);
    setGeneratedCode('');
    setTokenFormData(null);

    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(TREASURY_WALLET_ADDRESS),
                lamports: Math.round(feeInLamports), // Use Math.round to avoid floating point issues
            })
        );
        
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'processed');

        // Payment successful, now generate code
        setIsPaying(false);
        setIsLoading(true);
        const code = await generateTokenContract(activeTab, formData, selectedChain);
        setGeneratedCode(code);
        setTokenFormData(formData);

    } catch (err: any) {
        console.error("Payment/Generation Error:", err);
        let message = "An unknown error occurred.";

        if (err instanceof WalletError) {
          message = err.message || 'Transaction was rejected by the user.';
        } else if (err instanceof Error) {
            message = err.message;
        }

        setError(`Process Failed: ${message}`);
        setWalletError(`Payment failed: ${message}`);
    } finally {
        setIsPaying(false);
        setIsLoading(false);
    }
  }, [activeTab, connected, connection, publicKey, sendTransaction, selectedChain, prices]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 antialiased">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Header />
        {walletError && (
          <div className="mt-4 p-4 text-sm bg-red-50 text-red-800 border border-red-200 rounded-lg" role="alert">
            <span className="font-medium">Connection Error:</span> {walletError}
          </div>
        )}
        {pricesError && (
          <div className="mt-4 p-4 text-sm bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg" role="alert">
            <span className="font-medium">Pricing Error:</span> {pricesError}
          </div>
        )}
        <main className="mt-8 md:mt-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Create Your EVM Token</h2>
            <p className="mt-2 text-slate-500">Select your target blockchain, token type, and fill in the details. A small fee in SOL is required.</p>
            
            <div className="mt-6 space-y-6">
                <ChainSelector selectedChain={selectedChain} onChainChange={setSelectedChain} />
            </div>

            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-8">
              <TokenForm
                tokenType={activeTab}
                onSubmit={handlePaymentAndGeneration}
                isLoading={isLoading}
                isPaying={isPaying}
                selectedChain={selectedChain}
                prices={prices}
              />
            </div>
          </div>
          
          {(isPaying || isLoading || generatedCode || error) && (
            <div className="mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <CodeBlock 
                  code={generatedCode} 
                  isLoading={isLoading || isPaying}
                  loadingText={isPaying ? 'Processing payment...' : 'Generating smart contract...'}
                  error={error} 
                  tokenName={tokenFormData?.name}
                />
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;