/**
 * UniswapV3 utility functions for proper price limit handling
 */

// UniswapV3 constants for price limits
export const MIN_SQRT_RATIO = BigInt("4295128739");
export const MAX_SQRT_RATIO = BigInt("1461446703485210103287273052203988822378723970342");

/**
 * Determines the proper sqrtPriceLimitX96 based on swap direction
 * @param tokenIn - Address of input token
 * @param tokenOut - Address of output token
 * @param zeroForOne - Optional: if provided, uses this direction. Otherwise determines from token addresses
 * @returns The appropriate sqrtPriceLimitX96 value
 */
export function getSqrtPriceLimitX96(
  tokenIn: string,
  tokenOut: string,
  zeroForOne?: boolean
): bigint {
  // If zeroForOne is not provided, determine it from token addresses
  if (zeroForOne === undefined) {
    // Compare token addresses to determine direction
    // token0 < token1 in UniswapV3 pools (lexicographically)
    zeroForOne = tokenIn.toLowerCase() < tokenOut.toLowerCase();
  }

  // For zeroForOne = true (selling token0 for token1), price decreases
  // Use MIN_SQRT_RATIO + 1 to avoid exact boundary
  if (zeroForOne) {
    return MIN_SQRT_RATIO + BigInt(1);
  }
  
  // For zeroForOne = false (selling token1 for token0), price increases  
  // Use MAX_SQRT_RATIO - 1 to avoid exact boundary
  return MAX_SQRT_RATIO - BigInt(1);
}

/**
 * Creates proper exactInputSingle parameters for UniswapV3
 * @param params - Swap parameters
 * @returns Complete parameters with proper sqrtPriceLimitX96
 */
export function createExactInputSingleParams(params: {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  amountIn: bigint;
  amountOutMinimum: bigint;
  zeroForOne?: boolean;
}) {
  return {
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    fee: params.fee,
    recipient: params.recipient,
    amountIn: params.amountIn,
    amountOutMinimum: params.amountOutMinimum,
    sqrtPriceLimitX96: getSqrtPriceLimitX96(params.tokenIn, params.tokenOut, params.zeroForOne),
  };
}

/**
 * Token addresses for reference
 */
export const TOKENS = {
  USDC_ARBITRUM: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  SKATE: "0x61DBbBb552dc893ab3aAd09F289f811E67cEf285",
} as const;

/**
 * UniswapV3 Router address
 */
export const UNISWAP_V3_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45" as const;