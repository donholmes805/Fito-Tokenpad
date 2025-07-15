export enum TokenType {
  Standard = 'Standard',
  LiquidityGenerator = 'Liquidity Generator',
}

export enum Chain {
  Ethereum = 'Ethereum',
  Polygon = 'Polygon',
  Bsc = 'BNB Smart Chain',
  Fitochain = 'Fitochain',
  Avalanche = 'Avalanche C-Chain',
}

export interface StandardTokenForm {
  name: string;
  symbol: string;
  decimals: string;
  totalSupply: string;
}

export interface LiquidityTokenForm extends StandardTokenForm {
  routerAddress: string;
  marketingWallet: string;
  liquidityFee: string;
  marketingFee: string;
}

// EVM provider types are no longer needed.
declare global {
  interface Window {
    // ethereum is no longer used for this app
  }
}
