import { serializeSignature } from "viem";
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";
import { sign } from "viem/accounts";
import { SkateTask, AvsProofData, constructProofFromTaskBundle } from "../lib/avs";
import { PERFORMER, OTHENTIC_AGGREGATOR_RPC, PERFORMER_KEY } from "../lib/const";
import { newConsumer } from "../lib/zeromq";

const avsProofDataQueue: AvsProofData[] = [];
const skateTaskQueue: SkateTask[] = [];
const failedAvsSendCache: {proofData: AvsProofData, timestamp: number}[] = [];

let resumeExecution: null | (() => void) = null; // Function to forcefully resume execution.
async function* avsTaskIterator() {
  while (true) {
    const queueLength = avsProofDataQueue.length;
    console.log(`ENTERING: AVS queue length = ${queueLength}`);
    if (queueLength > 0) {
      console.log("Yielding tasks");
      yield avsProofDataQueue.shift()!;
    } else {
      await new Promise<void>((resolve) => {
        resumeExecution = () => {
          resolve();
        }
      });
      console.log("-------------\n*avsTaskIterator() resumed\n-------------");
    }
  }
}

var jsonRpcRequestID = 1;
/**
 * NOTE: check the function signature with othentic stateless rollup framework
 *
 * Sign with performer (EOA) signature then send to Othentic P2P topic for attestation
 */
async function signAndSendAvsTask(avsProof: AvsProofData) {
  const { proofOfTask, data, taskDefinitionId } = avsProof;
  const message = encodeAbiParameters(parseAbiParameters(["string", "bytes", "address", "uint16"]), [
    proofOfTask,
    data,
    PERFORMER.address,
    taskDefinitionId,
  ]);
  const messageHash = keccak256(message);

  const signature = serializeSignature(await sign({ hash: messageHash, privateKey: PERFORMER_KEY }));

  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [proofOfTask, data, taskDefinitionId, PERFORMER.address, signature],
    id: jsonRpcRequestID++,
  };

  const response = await fetch(OTHENTIC_AGGREGATOR_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonRpcBody),
  });

  if (response.status >= 200 && response.status < 300) {
    console.log(`AVS.Performer::Sender -- Sent batch with proof=${avsProof.proofOfTask} to Aggregator`);
    const result = await response.text();
    console.info("AVS.Performer::Sender -- sendTask::Response: ", result);
  } else {
    // TODO: Make sure the task must be sent
    //  1. Put into a failed cache map
    //  2. Iterate through the cache and resend after X (15) seconds
    console.warn(`AVS.Performer::Sender -- Redirection response: ${response.status}`);
    const errorText = await response.text();
    console.error("AVS.Performer::Sender -- sendTask::Errors: ", errorText);
  }
}

/**
 * Consume avsTaskIterator to send bundled information to the AVS.
 */
async function startSendingAvsTasks(): Promise<void> {
  for await (const avsTask of avsTaskIterator()) {
    const { data, ...rest } = avsTask;
    console.log(`Sending to aggregator: `, { ...rest, data: "<largeBytesString>" });
    try {
      await signAndSendAvsTask(avsTask);
    } catch (e) {
      console.error(`Sign and send error --- `, e);
    }
  }
  console.log("DONE");
}

/**
 * Bundle tasks from Message Box and schedule into avs task queue.
 */
function bundleTaskQToAvsTask() {
  if (skateTaskQueue.length === 0) {
    return false; // No tasks to bundle, and no force flag
  }

  console.log(`Resume execution set? `, !!resumeExecution);
  if (!!resumeExecution) {
    resumeExecution(); // Call resumeExecution if set to continue iterator
    resumeExecution = null;
  }
  const tasksToBundle = [...skateTaskQueue]; // Copy tasks
  const avsTask = constructProofFromTaskBundle(tasksToBundle);
  avsProofDataQueue.push(avsTask);
  console.log(`AVS.Performer::Sender -- Bundling ${tasksToBundle.length} tasks | PENDING ${avsProofDataQueue.length} AVS tasks`);
  skateTaskQueue.splice(0, tasksToBundle.length);
  return true;
}


export default async function main() {
  const EXECUTION_TIMEOUT = 5_000; // Timeout to force process without full log bundle, i.e. logs.size < BUNDLE_SIZE

  setInterval(() => {
    const isReady = bundleTaskQToAvsTask();
    if (isReady) {
      console.log(`AVS.Performer::Sender -- ${EXECUTION_TIMEOUT}ms Time out, proceeds with execution`);
    }
  }, EXECUTION_TIMEOUT);

  const onTaskReceived = (t: SkateTask) => {
    const { user, chainId, taskId } = t;
    skateTaskQueue.push(t);

    console.info(`AVS.Performer::Sender -- Received task: id=${taskId} | user=${user} | chainId=${chainId}`);

    const MAX_BULE_SIZE = 100;
    if (skateTaskQueue.length >= MAX_BULE_SIZE) {
      bundleTaskQToAvsTask();
    }
  }

  const consumer = await newConsumer<SkateTask>();
  consumer.registerTaskReceiveHandler(onTaskReceived);
  consumer.processTasks();

  await startSendingAvsTasks();
}

main();
