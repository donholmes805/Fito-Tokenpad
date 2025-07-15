// Price constants are now defined directly in this file to avoid serverless import issues.
// You can still manage prices from the backend by editing these values.
const STANDARD_TOKEN_SOL_FEE = 0.37;
const LIQUIDITY_TOKEN_SOL_FEE = 0.62;

export default async (req: Request): Promise<Response> => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'GET' },
    });
  }

  try {
    // Construct the prices object from the local constants
    const prices = {
      standard: STANDARD_TOKEN_SOL_FEE,
      liquidity: LIQUIDITY_TOKEN_SOL_FEE,
    };

    return new Response(JSON.stringify(prices), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/get-prices:", error);
    return new Response(JSON.stringify({ error: 'Could not retrieve prices from server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
