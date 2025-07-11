import { ethers } from 'ethers';

export enum TokenType {
  Standard = 'Standard',
  LiquidityGenerator = 'Liquidity Generator',
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

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}
