import { watchAttestation, collectAttestation } from "./_attestationCenterProcessor_";
import { type CollectorConfig, startCollectionProcess } from "./_collector_";

import { l2Client } from "../../lib/client";
import { MODE } from "../../lib/env";
import { getBatchAvsTasks } from "../../lib/db";

const CHECKPOINT_FP = "progress/avs.attestationCenter.json";

async function main() {
  const mode = MODE;
  watchAttestation(mode);

  // const context = "AttestationCenter.Indexer::";
  // const avsConfig: CollectorConfig = {
  //   mode,
  //   context,
  //   genesisBlock: 0,
  //   collectFunction: collectAttestation,
  //   watchFunction: () => watchAttestation(mode),
  //   getBlockNumber: l2Client.getBlockNumber,
  //   checkpointFile: CHECKPOINT_FP,
  //   maxBlockRange: 5_000n,
  // };
  //
  // await startCollectionProcess(avsConfig);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
