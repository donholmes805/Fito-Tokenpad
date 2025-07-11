import React, { useState, useEffect } from 'react';
import { TokenType, StandardTokenForm, LiquidityTokenForm } from '../types';
import { STANDARD_TOKEN_USD_FEE, LIQUIDITY_TOKEN_USD_FEE } from '../config';
import Spinner from './Spinner';

interface TokenFormProps {
  tokenType: TokenType;
  onSubmit: (formData: StandardTokenForm | LiquidityTokenForm) => void;
  isLoading: boolean;
  isPaying: boolean;
  walletAddress: string | null;
}

const initialStandardState: StandardTokenForm = {
  name: '',
  symbol: '',
  decimals: '18',
  totalSupply: '',
};

const initialLiquidityState: LiquidityTokenForm = {
  ...initialStandardState,
  routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router v2, a common default. Should be updated for Fitochain.
  marketingWallet: '',
  liquidityFee: '2',
  marketingFee: '3',
};

function TokenForm({ tokenType, onSubmit, isLoading, isPaying, walletAddress }: TokenFormProps): React.ReactNode {
  const [formData, setFormData] = useState<StandardTokenForm | LiquidityTokenForm>(initialStandardState);

  useEffect(() => {
    setFormData(currentData => {
      const commonFields = {
        name: currentData.name,
        symbol: currentData.symbol,
        decimals: currentData.decimals,
        totalSupply: currentData.totalSupply,
      };

      if (tokenType === TokenType.Standard) {
        return commonFields;
      } else {
        const existingLiquidityData = currentData as LiquidityTokenForm;
        return {
          ...initialLiquidityState,
          ...commonFields,
          marketingWallet: existingLiquidityData.marketingWallet || walletAddress || "",
        };
      }
    });
  }, [tokenType, walletAddress]);

  useEffect(() => {
    if (walletAddress && tokenType === TokenType.LiquidityGenerator) {
      setFormData(currentData => {
        const currentLiquidityData = currentData as LiquidityTokenForm;
        if (!currentLiquidityData.marketingWallet) {
          return { ...currentLiquidityData, marketingWallet: walletAddress };
        }
        return currentLiquidityData;
      });
    }
  }, [walletAddress, tokenType]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isStandard = tokenType === TokenType.Standard;
  const isBusy = isLoading || isPaying;

  const feeInUSD = tokenType === TokenType.Standard ? STANDARD_TOKEN_USD_FEE : LIQUIDITY_TOKEN_USD_FEE;

  let buttonText = `$${feeInUSD} FITO & Generate Code`;
  if (isPaying) {
    buttonText = 'Processing Payment...';
  } else if (isLoading) {
    buttonText = 'Generating Code...';
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Token Name</label>
          <input type="text" name="name" id="name" required placeholder="e.g., Fito Coin" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-slate-700">Token Symbol</label>
          <input type="text" name="symbol" id="symbol" required placeholder="e.g., FITO" value={formData.symbol} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="decimals" className="block text-sm font-medium text-slate-700">Decimals</label>
          <input type="number" name="decimals" id="decimals" required placeholder="18" value={formData.decimals} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="totalSupply" className="block text-sm font-medium text-slate-700">Total Supply</label>
          <input type="number" name="totalSupply" id="totalSupply" required placeholder="e.g., 1000000" value={formData.totalSupply} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
        </div>
      </div>

      {!isStandard && (
        <div className="pt-6 border-t border-slate-200 space-y-6">
          <h3 className="text-lg font-medium text-slate-800">Liquidity Generator Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="routerAddress" className="block text-sm font-medium text-slate-700">DEX Router Address</label>
              <input type="text" name="routerAddress" id="routerAddress" required value={(formData as LiquidityTokenForm).routerAddress} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="marketingWallet" className="block text-sm font-medium text-slate-700">Marketing Wallet Address</label>
              <input type="text" name="marketingWallet" id="marketingWallet" required placeholder="Connect wallet to pre-fill or paste address" value={(formData as LiquidityTokenForm).marketingWallet} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="liquidityFee" className="block text-sm font-medium text-slate-700">Liquidity Fee (%)</label>
              <input type="number" step="0.1" name="liquidityFee" id="liquidityFee" required value={(formData as LiquidityTokenForm).liquidityFee} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="marketingFee" className="block text-sm font-medium text-slate-700">Marketing Fee (%)</label>
              <input type="number" step="0.1" name="marketingFee" id="marketingFee" required value={(formData as LiquidityTokenForm).marketingFee} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
            </div>
          </div>
        </div>
      )}

      <div className="pt-5">
        <div className="flex justify-end">
          <button type="submit" disabled={isBusy} className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-wait transition-colors duration-200">
            {isBusy && <Spinner />}
            {buttonText}
          </button>
        </div>
      </div>
    </form>
  );
}

export default TokenForm;