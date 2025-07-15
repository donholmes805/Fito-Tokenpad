import { TokenType, StandardTokenForm, LiquidityTokenForm, Chain } from '../types';

/**
 * Sends a request to the secure backend serverless function to generate the token contract.
 * The API call to Gemini is handled by the backend, keeping the API key safe.
 * @param tokenType The type of token to generate ('Standard' or 'Liquidity Generator').
 * @param formData The form data containing token details.
 * @param selectedChain The target blockchain for the token contract.
 * @returns A promise that resolves to the generated Solidity code string.
 */
export const generateTokenContract = async (
  tokenType: TokenType,
  formData: StandardTokenForm | LiquidityTokenForm,
  selectedChain: Chain
): Promise<string> => {
  try {
    const apiResponse = await fetch('/api/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenType, formData, selectedChain }),
    });

    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        try {
            // Try to parse the error response as JSON.
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `Server responded with status: ${apiResponse.status}`);
        } catch(e) {
            // If it's not JSON, use the raw text as the error.
            throw new Error(errorText || `Server responded with status: ${apiResponse.status}`);
        }
    }

    const result = await apiResponse.json();

    if (result.solidityCode) {
      return result.solidityCode;
    } else {
      throw new Error("Received an invalid response from the server.");
    }
    
  } catch (error) {
    console.error("Error calling backend service:", error);
    // Re-throw a user-friendly error message.
    if(error instanceof Error){
       throw new Error(`Failed to generate smart contract. Reason: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the smart contract.");
  }
};