import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function Header(): React.ReactNode {
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
      
      <WalletMultiButton />
    </header>
  );
}

export default Header;