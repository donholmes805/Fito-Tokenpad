import React from 'react';
import { Chain } from '../types';

interface ChainSelectorProps {
  selectedChain: Chain;
  onChainChange: (chain: Chain) => void;
}

const chainOptions = Object.values(Chain);

export function ChainSelector({ selectedChain, onChainChange }: ChainSelectorProps): React.ReactNode {
  return (
    <div>
      <label htmlFor="chain-select" className="block text-sm font-medium text-slate-700">
        Target Blockchain
      </label>
      <select
        id="chain-select"
        name="chain"
        value={selectedChain}
        onChange={(e) => onChainChange(e.target.value as Chain)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md shadow-sm"
      >
        {chainOptions.map((chain) => {
          if (chain === Chain.Fitochain) {
            return (
              <option key={chain} value={chain} disabled>
                Fitochain (Unavailable)
              </option>
            );
          }
          return (
            <option key={chain} value={chain}>
              {chain}
            </option>
          );
        })}
      </select>
    </div>
  );
}