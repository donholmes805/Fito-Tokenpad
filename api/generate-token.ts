import { GoogleGenAI } from "@google/genai";

// Self-contained types for the serverless function.
enum TokenType {
  Standard = 'Standard',
  LiquidityGenerator = 'Liquidity Generator',
}

// Added to support multi-chain generation
enum Chain {
  Ethereum = 'Ethereum',
  Polygon = 'Polygon',
  Bsc = 'BNB Smart Chain',
  Fitochain = 'Fitochain',
  Avalanche = 'Avalanche C-Chain',
}

interface StandardTokenForm {
  name: string;
  symbol: string;
  decimals: string;
  totalSupply: string;
}

interface LiquidityTokenForm extends StandardTokenForm {
  routerAddress: string;
  marketingWallet: string;
  liquidityFee: string;
  marketingFee: string;
}

const generateStandardTokenPrompt = (formData: StandardTokenForm, chainName: string): string => `
You are an expert Solidity smart contract developer specializing in secure and optimized token contracts for EVM-compatible chains.
Generate a Solidity smart contract for a standard ERC-20 style token for the ${chainName} blockchain.

**Contract Requirements:**
1.  Use Solidity version ^0.8.20.
2.  Import 'ERC20.sol' and 'Ownable.sol' from OpenZeppelin contracts (\`@openzeppelin/contracts/\`).
3.  The contract should be named "${formData.name.replace(/\s/g, '')}".
4.  The token name should be "${formData.name}".
5.  The token symbol should be "${formData.symbol}".
6.  The token should have ${formData.decimals} decimals.
7.  The total supply should be ${formData.totalSupply} tokens. Correctly handle the decimals in the minting function (e.g., \`_mint(msg.sender, ${formData.totalSupply} * 10**${formData.decimals})\`).
8.  The entire total supply should be minted to the contract deployer's address (\`msg.sender\`) in the constructor.
9.  The contract must inherit from \`ERC20\` and \`Ownable\`.

**Output Format:**
Return ONLY a JSON object with a single key "solidityCode" containing the complete Solidity code as a string. Do not include any other text, explanations, or markdown fences around the JSON.
Example: { "solidityCode": "pragma solidity ^0.8.20; ..." }
`;

const generateLiquidityTokenPrompt = (formData: LiquidityTokenForm, chainName: string): string => `
You are an expert Solidity smart contract developer specializing in secure and optimized DeFi token contracts for EVM-compatible chains.
Generate a complete Solidity smart contract for an ERC-20 style token with liquidity generation and marketing fees for the ${chainName} blockchain.

**Contract Requirements:**
1.  Use Solidity version ^0.8.20.
2.  Import necessary OpenZeppelin contracts: \`ERC20.sol\`, \`Ownable.sol\`. Also include interfaces for \`IUniswapV2Router02.sol\` and \`IUniswapV2Factory.sol\`.
3.  The contract should be named "${formData.name.replace(/\s/g, '')}".
4.  Token Details: Name "${formData.name}", Symbol "${formData.symbol}", Decimals ${formData.decimals}.
5.  Total Supply: ${formData.totalSupply} tokens, minted to the deployer.
6.  **Fees:**
    - Liquidity Fee: ${formData.liquidityFee}%
    - Marketing Fee: ${formData.marketingFee}%
7.  **Tax Logic:**
    - On token transfers, collect the specified fees from the sender.
    - Store the collected tokens for liquidity and marketing separately within the contract.
    - Exclude the owner, the contract address itself, and the DEX pair from fees.
8.  **Automatic Liquidity Generation:**
    - When the number of collected tokens for liquidity reaches a certain threshold (e.g., 500,000 tokens), the contract should automatically trigger a swap and liquify event.
    - The trigger should swap half of the threshold tokens for the native chain currency (e.g., ETH for Ethereum, MATIC for Polygon, BNB for BSC) and add it as liquidity to the DEX with the other half of the tokens.
    - The marketing fee tokens should be swapped for native currency and sent to the marketing wallet.
9.  **DEX Integration:**
    - Use the provided Uniswap V2 compatible router address: \`${formData.routerAddress}\`.
10. **Wallets:**
    - Marketing fees should be sent to the marketing wallet address: \`${formData.marketingWallet}\`.
11. **Functions:**
    - The contract owner must be able to update fee percentages, the marketing wallet, and the swap threshold.
    - Include a manual function for the owner to trigger the swap and liquify process.
    - The owner should be able to exclude/include addresses from fees.
    - Transfers between excluded addresses should not incur fees.

**Output Format:**
Return ONLY a JSON object with a single key "solidityCode" containing the complete Solidity code as a string. Do not include any other text, explanations, or markdown fences around the JSON.
`;

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY environment variable not set.");
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { tokenType, formData, selectedChain } = await req.json();

    if (!tokenType || !formData || !selectedChain || !Object.values(TokenType).includes(tokenType) || !Object.values(Chain).includes(selectedChain)) {
      return new Response(JSON.stringify({ error: 'Invalid request body. `tokenType`, `formData`, and `selectedChain` are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt =
      tokenType === TokenType.Standard
        ? generateStandardTokenPrompt(formData as StandardTokenForm, selectedChain)
        : generateLiquidityTokenPrompt(formData as LiquidityTokenForm, selectedChain);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
    });

    let jsonStr = response.text.trim();
    // The model sometimes wraps the JSON in markdown fences, so we strip them.
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (parsedData && typeof parsedData.solidityCode === 'string') {
      return new Response(JSON.stringify({ solidityCode: parsedData.solidityCode }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error("Invalid response format from AI. Expected a JSON object with a 'solidityCode' key.");
    }
  } catch (error) {
    console.error("Error in /api/generate-token:", error);
    const message = error instanceof Error ? error.message : "An unknown server error occurred.";
    return new Response(JSON.stringify({ error: `Failed to communicate with the AI model. ${message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
};
