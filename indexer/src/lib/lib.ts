function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function exponentialRetry({
  fn,
  maxAttempts = 3,
}: {
  fn: () => Promise<any>;
  maxAttempts?: number;
}): Promise<{ success: boolean; result: any; errors: unknown[] }> {
  let attempt = 0;
  let success = false;
  let errors = [];
  let result = null;

  while (attempt < maxAttempts && !success) {
    try {
      result = await fn();
      success = true;
    } catch (err) {
      errors.push(err);
      attempt++;
      if (attempt < maxAttempts) {
        await sleep(2 ** attempt * 1000); // Exponential backoff
      }
    }
  }

  return { success, result, errors };
}
