import { EnvMode } from "../../lib/env";
import { loadCheckpoint, mergeIntervals, saveCheckpoint } from "./_fsHandler_";

type Collector = (mode: EnvMode, fromBlock: bigint, toBlock: bigint | undefined) => Promise<any>;

export interface CollectorConfig {
  mode: EnvMode;
  context: string;
  genesisBlock: number;
  collectFunction: Collector;
  watchFunction: () => Promise<any>;
  getBlockNumber: () => Promise<bigint>;
  checkpointFile: string;
  maxBlockRange?: bigint;
  archivedRpc?: boolean;
}

const MAX_BLOCK_RANGE = 1000n; // Maximum block range
const BACKUP_INTERVAL = 120_000; // 2 minutes

export async function startCollectionProcess({
  archivedRpc = true,
  maxBlockRange = MAX_BLOCK_RANGE,
  ...config
}: CollectorConfig) {
  console.info(`Starting ${config.checkpointFile} collection process...`);

  let intervals = await loadCheckpoint(config.checkpointFile);

  if (archivedRpc) {
    let startBlock: bigint;
    // 1.a Collect past data
    // NOTE: do thrice to make sure we don't miss any block
    for (let it = 0; it < 3; it++) {
      startBlock = intervals.length > 0 ? BigInt(intervals[intervals.length - 1].end + 1) : BigInt(config.genesisBlock);
      intervals.push({ start: Number(startBlock), end: Number(startBlock) });
      const currentBlock = await config.getBlockNumber();
      while (startBlock <= currentBlock) {
        const endBlock = startBlock + maxBlockRange - 1n <= currentBlock ? startBlock + maxBlockRange : currentBlock;
        try {
          await config.collectFunction(config.mode, startBlock, endBlock);
        } catch (e) {
          console.log(`${config.context} collect error: `, e);
        }

        // save progress, write latency << block latency
        intervals[intervals.length - 1].end = Number(endBlock);
        intervals = await mergeIntervals(intervals);
        await saveCheckpoint(config.checkpointFile, intervals);

        // new iteration
        startBlock = endBlock + 1n;
      }
    }
  } else {
    // 1.b Directly collect from current blocks
    const currentBlock = await config.getBlockNumber();

    intervals.push({ start: Number(currentBlock), end: Number(currentBlock) });
    intervals = await mergeIntervals(intervals);
  }

  // 2. Watch for any new data
  await config.watchFunction();
  const backUpUnwatch = setInterval(async () => {
    intervals[intervals.length - 1].end = Number(await config.getBlockNumber());
    await saveCheckpoint(config.checkpointFile, intervals);
  }, BACKUP_INTERVAL);

  const cleanup = async () => {
    clearInterval(backUpUnwatch);
    intervals[intervals.length - 1].end = Number(await config.getBlockNumber());
    await saveCheckpoint(config.checkpointFile, intervals);
  };

  process.on("SIGINT", async () => {
    console.info(`SIGINT exit ${config.context}`);
    await cleanup();
    process.exit();
  });

  process.on("SIGTERM", async () => {
    console.info(`SIGTERM exit ${config.context}`);
    await cleanup();
    process.exit();
  });

  process.on("exit", async (code) => {
    console.info(`Process exit with code: ${code}`);
    await cleanup();
  });

  process.on("uncaughtException", async (error) => {
    console.error(`Uncaught exception: ${error}`);
    await cleanup();
    process.exit(1); // Exit with failure
  });
}
