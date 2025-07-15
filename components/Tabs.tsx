
import React from 'react';
import { TokenType } from '../types';

interface TabsProps {
  activeTab: TokenType;
  onTabChange: (tab: TokenType) => void;
}

const tabOptions: TokenType[] = [TokenType.Standard, TokenType.LiquidityGenerator];

function Tabs({ activeTab, onTabChange }: TabsProps): React.ReactNode {
  return (
    <div className="mt-6 border-b border-slate-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabOptions.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              transition-colors duration-200 ease-in-out
              ${
                activeTab === tab
                  ? 'border-slate-800 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
            `}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Tabs;
