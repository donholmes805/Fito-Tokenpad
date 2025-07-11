import React from 'react';

interface HeaderProps {
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  walletAddress: string | null;
  isConnecting: boolean;
}

function Header({ onConnectWallet, onDisconnectWallet, walletAddress, isConnecting }: HeaderProps): React.ReactNode {
  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <img 
          src="https://fitochain.com/wp-content/uploads/2025/06/Fi.svg" 
          alt="Fitochain Logo" 
          className="h-12 w-12"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Fito Tokenpad
        </h1>
      </div>
      
      {walletAddress ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-green-500" aria-label="Connected"></span>
            <span className="text-sm font-mono text-slate-700">{truncateAddress(walletAddress)}</span>
          </div>
          <button
            onClick={onDisconnectWallet}
            title="Disconnect Wallet"
            className="bg-slate-200 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-slate-400 font-medium rounded-lg text-sm p-2.5 text-center transition-colors duration-200"
            aria-label="Disconnect Wallet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={onConnectWallet}
          disabled={isConnecting}
          className="bg-slate-800 text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-slate-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200 whitespace-nowrap disabled:bg-slate-400 disabled:cursor-wait"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </header>
  );
}

export default Header;