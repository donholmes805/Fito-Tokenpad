import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenType, StandardTokenForm, LiquidityTokenForm } from './types';
import { generateTokenContract } from './services/geminiService';
import { STANDARD_TOKEN_USD_FEE, LIQUIDITY_TOKEN_USD_FEE, FITO_PRICE_USD, TREASURY_WALLET_ADDRESS } from './config';
import Header from './components/Header';
import Tabs from './components/Tabs';
import TokenForm from './components/TokenForm';
import CodeBlock from './components/CodeBlock';
import Footer from './components/Footer';

// Correct Fitochain network details as per user specification
const FITOCHAIN_MAINNET = {
  chainId: '0x4D1', // 1233 in hex
  chainName: 'Fitochain',
  nativeCurrency: {
    name: 'FITO',
    symbol: 'FITO',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.fitochain.com'],
  blockExplorerUrls: ['https://explorer.fitochain.com/'],
};

function App(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<TokenType>(TokenType.Standard);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [tokenFormData, setTokenFormData] = useState<StandardTokenForm | LiquidityTokenForm | null>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setProvider(null);
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setWalletError('MetaMask is not installed. Please install it to connect your wallet.');
      return;
    }

    setIsConnecting(true);
    setWalletError(null);

    try {
      // Request to switch to Fitochain
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: FITOCHAIN_MAINNET.chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [FITOCHAIN_MAINNET],
            });
          } catch (addError) {
            console.error('Failed to add Fitochain network', addError);
            throw new Error('Failed to add Fitochain network. Please add it manually.');
          }
        } else {
            console.error('Failed to switch network', switchError);
            throw new Error('Failed to switch to the Fitochain network. Please switch manually in your wallet.');
        }
      }
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      const accounts = await browserProvider.send('eth_requestAccounts', []);

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setWalletError(`Connection failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletAddress(accounts[0]);
         if(window.ethereum) {
          setProvider(new ethers.BrowserProvider(window.ethereum));
        }
      }
    };
    
    ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [disconnectWallet]);


  const handlePaymentAndGeneration = useCallback(async (formData: StandardTokenForm | LiquidityTokenForm) => {
    if (!provider || !walletAddress) {
      const connectError = "Please connect your wallet to proceed.";
      setError(connectError);
      setWalletError(connectError);
      return;
    }

    const feeInUSD = activeTab === TokenType.Standard ? STANDARD_TOKEN_USD_FEE : LIQUIDITY_TOKEN_USD_FEE;
    const feeInFito = feeInUSD / FITO_PRICE_USD;

    setIsPaying(true);
    setError('');
    setGeneratedCode('');
    setTokenFormData(null);

    try {
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction({
            to: TREASURY_WALLET_ADDRESS,
            value: ethers.parseEther(feeInFito.toString()),
        });

        await tx.wait(); // Wait for the transaction to be mined
        
        // Payment successful, now generate code
        setIsPaying(false);
        setIsLoading(true);
        const code = await generateTokenContract(activeTab, formData);
        setGeneratedCode(code);
        setTokenFormData(formData);

    } catch (err: any) {
        const code = err.code;
        let message = (err as any).shortMessage || err.message || 'An unknown error occurred.';
        if (code === 'ACTION_REJECTED') {
            message = "Transaction was rejected by the user.";
        }
        setError(`Process Failed: ${message}`);
        console.error(err);
    } finally {
        setIsPaying(false);
        setIsLoading(false);
    }
  }, [activeTab, provider, walletAddress]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 antialiased">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Header 
          onConnectWallet={connectWallet}
          onDisconnectWallet={disconnectWallet}
          walletAddress={walletAddress}
          isConnecting={isConnecting}
        />
        {walletError && (
          <div className="mt-4 p-4 text-sm bg-red-50 text-red-800 border border-red-200 rounded-lg" role="alert">
            <span className="font-medium">Error:</span> {walletError}
          </div>
        )}
        <main className="mt-8 md:mt-12">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Create Your Token</h2>
            <p className="mt-2 text-slate-500">Select your token type and fill in the details below. A small fee in FITO is required.</p>
            
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-8">
              <TokenForm
                tokenType={activeTab}
                onSubmit={handlePaymentAndGeneration}
                isLoading={isLoading}
                isPaying={isPaying}
                walletAddress={walletAddress}
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