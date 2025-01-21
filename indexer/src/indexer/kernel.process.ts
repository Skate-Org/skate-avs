import { watchIntent, collectIntent } from "./kernel.service";

import { skateClient } from "../common/client";
import { type CollectorConfig, messageBoxGenesisBlockFromMode, startCollectionProcess } from "./utils";
import { MODE } from "../common/env";

const INTENT_CHECKPOINT = "progress/kernel.json";

async function main() {
  const context = "SkateAvs.Indexer::Collector.Kernel";

  const mode = MODE;
  const collectorConfig: CollectorConfig = {
    mode,
    context,
    genesisBlock: messageBoxGenesisBlockFromMode(mode),
    collectFunction: collectIntent,
    watchFunction: () => watchIntent(mode),
    getBlockNumber: skateClient.getBlockNumber,
    checkpointFile: INTENT_CHECKPOINT,
    maxBlockRange: 1_000n,
  };

  await startCollectionProcess(collectorConfig);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
