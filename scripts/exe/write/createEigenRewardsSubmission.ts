import {
  L1_EXPLORER,
  AVS_GOVERNANCE_ADDRESS,
  AVS_TREASURY_L1,
  ATTESTATION_CENTER_ADDRESS,
} from "../../lib/const";
import {
  avsOwnerAccount,
  l1Client,
  l1WriteClient,
  l2Client,
} from "../../lib/client";
import { AvsGovernance_ABI } from "../../lib/ABI/AvsGovernance";
import { AttestationCenter_ABI } from "../../lib/ABI/AttestationCenter";
import { EzSKATE, EzRVault_ABI } from "../../lib/ABI/EzRVault";
import { formatEther, parseEther } from "viem";

// Default parameters for EigenLayer rewards submission
const SUBMISSION_TIME_QUANTA = 86400;
const DEFAULT_DURATION = SUBMISSION_TIME_QUANTA * 7; // WARN: Must be retroactive
const DEFAULT_AMOUNT = 449913334160000000000000n;
const DEFAULT_START_TIME = Math.floor(Date.now() / 1000) - DEFAULT_DURATION;
const DRY_RUN = true;

interface OperatorInfo {
  address: string;
  id: bigint;
  votingPower: bigint;
  isActive: boolean;
}

async function fetchAllOperators(): Promise<OperatorInfo[]> {
  console.log("\n=== Fetching All Operators from L2 AttestationCenter ===");

  // Get number of active operators from L2 AttestationCenter
  const numberOfOperators = await l2Client.readContract({
    address: ATTESTATION_CENTER_ADDRESS,
    abi: AttestationCenter_ABI,
    functionName: "numOfActiveOperators",
  });
  console.log(`Number of active operators: ${numberOfOperators}`);

  const operators: OperatorInfo[] = [];
  const seenOperatorAddresses = new Set<string>();

  // Iterate through all operator IDs (1-indexed)
  for (let id = 1; id <= numberOfOperators; id++) {
    const paymentDetails = await l2Client.readContract({
      address: ATTESTATION_CENTER_ADDRESS,
      abi: AttestationCenter_ABI,
      functionName: "getOperatorPaymentDetail",
      args: [BigInt(id)],
    });

    const operatorAddress = paymentDetails.operator;

    // Check if operator address has already been processed
    if (seenOperatorAddresses.has(operatorAddress)) {
      console.log(
        `${id}. ${operatorAddress} (⚠️  DUPLICATE L2 entry - skipping)`,
      );
      continue;
    }

    // Check if operator is registered on L1
    const isRegistered = await l1Client.readContract({
      address: AVS_GOVERNANCE_ADDRESS,
      abi: AvsGovernance_ABI,
      functionName: "isOperatorRegistered",
      args: [operatorAddress],
    });

    if (!isRegistered) {
      console.log(
        `${id}. ${operatorAddress} (❌ NOT REGISTERED on L1 - skipping)`,
      );
      continue;
    }

    // Get L1 voting power for this operator
    const l1VotingPower = await l1Client.readContract({
      address: AVS_GOVERNANCE_ADDRESS,
      abi: AvsGovernance_ABI,
      functionName: "votingPower",
      args: [operatorAddress],
    });

    const operatorInfo: OperatorInfo = {
      address: operatorAddress,
      id: BigInt(id),
      votingPower: l1VotingPower,
      isActive: true,
    };

    operators.push(operatorInfo);
    seenOperatorAddresses.add(operatorAddress);
    console.log(
      `${id}. ${operatorAddress} (✓ REGISTERED - L1 voting power: ${formatEther(l1VotingPower)})`,
    );
  }

  console.log(`\nTotal L2 operators checked: ${Number(numberOfOperators)}`);
  console.log(`Total L1 registered operators found: ${operators.length}`);

  if (operators.length !== Number(numberOfOperators)) {
    console.log(
      `⚠️  Warning: ${Number(numberOfOperators) - operators.length} operators from L2 were skipped (not registered on L1 or duplicate entries)`,
    );
  }

  return operators;
}

async function main() {
  // Get parameters from command line or use defaults
  let startTimestamp = process.argv[2]
    ? parseInt(process.argv[2])
    : DEFAULT_START_TIME;
  const duration = process.argv[3]
    ? parseInt(process.argv[3])
    : DEFAULT_DURATION;
  const amount = process.argv[4] ? parseEther(process.argv[4]) : DEFAULT_AMOUNT;

  // Ensure start timestamp is divisible by SUBMISSION_TIME_QUANTA (=86400 | daily aligned)
  if (startTimestamp % SUBMISSION_TIME_QUANTA !== 0) {
    const alignedTimestamp =
      Math.floor(startTimestamp / SUBMISSION_TIME_QUANTA) *
      SUBMISSION_TIME_QUANTA;
    console.log(`\nAdjusting start timestamp for daily alignment:`);
    console.log(
      `Original: ${startTimestamp} (${new Date(startTimestamp * 1000).toISOString()})`,
    );
    console.log(
      `Aligned:  ${alignedTimestamp} (${new Date(alignedTimestamp * 1000).toISOString()})`,
    );
    startTimestamp = alignedTimestamp;
  }

  console.log(`Creating EigenLayer Rewards Submission`);
  console.log(`Using account: ${avsOwnerAccount.address}`);
  console.log(`AVS Governance: ${AVS_GOVERNANCE_ADDRESS}`);
  console.log(`AVS Treasury: ${AVS_TREASURY_L1}`);
  console.log(
    `Start timestamp: ${startTimestamp} (${new Date(startTimestamp * 1000).toISOString()})`,
  );
  console.log(
    `Duration: ${duration} seconds (${Math.floor(duration / 86400)} days)`,
  );
  console.log(`Amount: ${formatEther(amount)} ezSKATE`);

  try {
    // Step 1: Fetch all active operators
    const operators = await fetchAllOperators();

    if (operators.length === 0) {
      console.log(
        "\n❌ No active operators found. Cannot create rewards submission.",
      );
      return;
    }

    const operatorAddresses = operators.map(
      (op) => op.address,
    ) as `0x${string}`[];
    console.log(`\nOperators to receive rewards:`);
    operators.forEach((op, index) => {
      console.log(
        `${index + 1}. ${op.address} (voting power: ${formatEther(op.votingPower)})`,
      );
    });

    // Step 2: Verify AVS Treasury has sufficient balance
    console.log("\nChecking AVS Treasury ezSKATE balance...");
    const treasuryBalance = await l1Client.readContract({
      address: EzSKATE,
      abi: EzRVault_ABI,
      functionName: "balanceOf",
      args: [AVS_TREASURY_L1],
    });

    console.log(
      `AVS Treasury ezSKATE balance: ${formatEther(treasuryBalance)} ezSKATE`,
    );

    if (treasuryBalance < amount) {
      console.log(
        `\nWarning: AVS Treasury balance (${formatEther(treasuryBalance)}) is less than rewards amount (${formatEther(amount)})`,
      );
      console.log(
        "Consider depositing more ezSKATE to the treasury before creating rewards submission.",
      );
    }

    // Step 3: Validate parameters
    const endTimestamp = startTimestamp + duration;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (startTimestamp < currentTimestamp) {
      console.log(
        `\nWarning: Start timestamp is in the past. Current time: ${new Date(currentTimestamp * 1000).toISOString()}`,
      );
    }

    if (duration < 86400) {
      console.log(
        `\nWarning: Duration is less than 24 hours (${duration} seconds). This may be too short for meaningful rewards distribution.`,
      );
    }

    console.log(
      `Rewards period: ${new Date(startTimestamp * 1000).toISOString()} to ${new Date(endTimestamp * 1000).toISOString()}`,
    );

    // Step 4: Create EigenLayer Rewards Submission (commented out for now)
    console.log(`\n=== EigenLayer Rewards Submission Preview ===`);
    console.log(`Operators: ${operatorAddresses.length}`);
    console.log(`Start timestamp: ${startTimestamp}`);
    console.log(`Duration: ${duration}`);
    console.log(`Amount: ${formatEther(amount)} ezSKATE`);

    if (!DRY_RUN) {
      // WARN: Sort operators by address in ASCENDING ORDER, REQUIRED by EigenLayer RewardsCoordinator contracts
      operatorAddresses.sort((a, b) => a.localeCompare(b));

      const { request } = await l1Client.simulateContract({
        account: avsOwnerAccount,
        address: AVS_GOVERNANCE_ADDRESS,
        abi: AvsGovernance_ABI,
        functionName: "createEigenRewardsSubmission",
        args: [
          operatorAddresses, // _operators (address[])
          startTimestamp, // _startTimestamp (uint32)
          duration, // _duration (uint32)
          amount, // _totalAmount (uint256)
        ],
      });

      const txHash = await l1WriteClient.writeContract(request);
      console.log(`EigenLayer rewards sent: ${L1_EXPLORER}/tx/${txHash}`);

      // Wait for transaction confirmation
      console.log("Waiting for transaction to be confirmed...");
      const receipt = await l1Client.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("EigenLayer rewards submission transaction confirmed!");

      // Step 5: Log submission details
      console.log(`\nEigenLayer Rewards Submission Summary:`);
      console.log(`Transaction hash: ${txHash}`);
      console.log(`Block number: ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed}`);
      console.log(
        `Start time: ${new Date(startTimestamp * 1000).toISOString()}`,
      );
      console.log(`End time: ${new Date(endTimestamp * 1000).toISOString()}`);
      console.log(
        `Duration: ${duration} seconds (${Math.floor(duration / 86400)} days)`,
      );
      console.log(`Rewards amount: ${formatEther(amount)} ezSKATE`);
      console.log(
        `Daily reward rate: ${formatEther((amount * BigInt(86400)) / BigInt(duration))} ezSKATE/day`,
      );
      console.log(`Operators: ${operatorAddresses.length}`);
      console.log(
        `Reward per operator: ${formatEther(amount / BigInt(operatorAddresses.length))} ezSKATE`,
      );

      // Step 6: Check if any events were emitted
      if (receipt.logs && receipt.logs.length > 0) {
        console.log(`\nTransaction emitted ${receipt.logs.length} log(s)`);
      }

      console.log(`\nEigenLayer rewards submission created successfully!`);
      console.log(
        `${operatorAddresses.length} operators in the network will now be eligible to receive rewards during the specified period.`,
      );
    }
  } catch (error) {
    console.error("\nEigenLayer rewards submission failed: ");

    throw error;
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log(
        "\nEigenLayer rewards submission process completed successfully!",
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nEigenLayer rewards submission process failed:", error);
      process.exit(1);
    });
}
