import { watchAttestation, collectAttestation } from "./avs.service";

import { l2Client } from "../common/client";
import { type CollectorConfig, messageBoxGenesisBlockFromMode, startCollectionProcess } from "./utils";
import { MODE } from "../common/env";

const INTENT_CHECKPOINT = "progress/avs.json";

async function main() {
  const context = "SkateAvs.Indexer::Collector.Avs";
  const mode = MODE;
  const avsConfig: CollectorConfig = {
    mode,
    context,
    genesisBlock: messageBoxGenesisBlockFromMode(mode),
    collectFunction: collectAttestation,
    watchFunction: () => watchAttestation(mode),
    getBlockNumber: l2Client.getBlockNumber,
    checkpointFile: INTENT_CHECKPOINT,
    maxBlockRange: 5_000n,
  };

  await startCollectionProcess(avsConfig);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
