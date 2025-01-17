import { getAvsDetails } from "./service/config";
import { saveToCache } from "./api/config";

export async function fetchAndCacheAvsDetails() {
  const avsConfig = await getAvsDetails();
  await saveToCache(avsConfig);
}

async function main() {
  const CONFIG_REFETCH_FREQUENCY = 60_000;
  setInterval(fetchAndCacheAvsDetails, CONFIG_REFETCH_FREQUENCY)
  await fetchAndCacheAvsDetails();
}

main()
