import fs from "fs/promises";
import path from "path";
import { AvsConfig } from "../service/config";

const CACHE_FILE_PATH = path.resolve(process.cwd(), "avs_data", "config.json");
async function ensureCacheDirectory() {
  const dirPath = path.dirname(CACHE_FILE_PATH);
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error("Error creating cache directory:", error);
  }
}

export async function loadFromCache(): Promise<AvsConfig | null> {
  await ensureCacheDirectory();
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    return JSON.parse(data) as AvsConfig;
  } catch (error) {
    console.error("Error loading from cache:", error);
    return null;
  }
}

export async function saveToCache(config: AvsConfig) {
  try {
    await ensureCacheDirectory();
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(config, null, 2));
    console.log(`Config cached successfully at ${CACHE_FILE_PATH}`);
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
}

///////////////// API //////////////////
let cachedAvsConfig: AvsConfig | null = null;
const loadConfig = async () => {
  cachedAvsConfig = await loadFromCache();
}
loadConfig();
const CACHE_RELOAD_FREQUENCY = 5_000;
setInterval(loadConfig, CACHE_RELOAD_FREQUENCY)
export function getAvsConfig() {
  return cachedAvsConfig;
}

