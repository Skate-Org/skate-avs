export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const BASE_DELAY = 1000;
const BASE_EXP = 2;

export async function exponentialRetry({
  fn,
  maxAttempts = 3,
  context = "UNKNOWN.exponentialRetry",
}: {
  fn: () => Promise<any>;
  maxAttempts?: number;
  context?: string;
}): Promise<{ success: boolean; result: any; errors: unknown[] }> {
  let attempt = 0;
  let success = false;
  let errors = [];
  let result = null;

  while (attempt < maxAttempts && !success) {
    try {
      result = await fn();
      success = true;
    } catch (err: any) {
      errors.push(err);
      attempt++;
      if (attempt < maxAttempts) {
        console.log(`${context}:: Attempt ${attempt} failed, retrying...`);
        await sleep(BASE_EXP ** attempt * BASE_DELAY); // Exponential backoff
      }
    }
  }

  return { success, result, errors };
}
