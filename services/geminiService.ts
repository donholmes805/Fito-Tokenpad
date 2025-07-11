import { TokenType, StandardTokenForm, LiquidityTokenForm } from '../types';

/**
 * Sends a request to the secure backend serverless function to generate the token contract.
 * The API call to Gemini is handled by the backend, keeping the API key safe.
 * @param tokenType The type of token to generate ('Standard' or 'Liquidity Generator').
 * @param formData The form data containing token details.
 * @returns A promise that resolves to the generated Solidity code string.
 */
export const generateTokenContract = async (
  tokenType: TokenType,
  formData: StandardTokenForm | LiquidityTokenForm
): Promise<string> => {
  try {
    const apiResponse = await fetch('/api/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenType, formData }),
    });

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      // The backend should return a JSON object with an 'error' key.
      throw new Error(result.error || `Server responded with status: ${apiResponse.status}`);
    }

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
