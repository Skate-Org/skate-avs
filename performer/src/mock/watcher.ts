import { IMessageBox_Legacy_ABI } from "../ABI/IMessageBox";
import { decodeEventLogs } from "../lib/avs";
import { legacyMessageBox, skateClient } from "../lib/const";

export default async function main() {
  // NOTE: watch and process live
  const logs = await skateClient.getContractEvents({
    address: legacyMessageBox("PRODUCTION"),
    abi: IMessageBox_Legacy_ABI,
    eventName: "TaskSubmitted",
    strict: true,
    fromBlock: 1982631n,
    toBlock: 1983831n,
    // fromBlock: 1813000n,
    // toBlock: 1813500n,
  });

  const decodedLogs = decodeEventLogs(logs);
  console.log(`Received ${decodedLogs.length} logs ---- `);
  for (const log of decodedLogs) {
    console.log(log)
    if (
      log.user.includes("48c224C377c9a9D263638B38ce412feE5F261D09".toLowerCase())
    ) {
      console.log(log)
    }
  }
  // decodedLogs.forEach((l) => sendData(l));
}

main();
