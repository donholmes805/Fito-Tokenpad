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

/**
 * Ethers' Eip1193Provider is minimal. This type extends it with event listener
 * methods that are commonly available on wallet providers like MetaMask.
 */
interface Eip1193ProviderWithEvents extends ethers.Eip1193Provider {
  on: (eventName: string | symbol, listener: (...args: any[]) => void) => this;
  removeListener: (eventName: string | symbol, listener: (...args: any[]) => void) => this;
}

declare global {
  interface Window {
    ethereum?: Eip1193ProviderWithEvents;
  }
}
