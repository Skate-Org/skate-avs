import { AvsGovernance_ABI } from "../../lib/ABI/AvsGovernance";
import {
  AVS_GOVERNANCE_ADDRESS,
  L1_EXPLORER,
  SKATE_BETA_EL_STRATEGY,
} from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";
import { parseUnits } from "viem";

async function main() {
  // const MULTIPLIER = 1n;
  const MULTIPLIER = parseUnits("1", 20);

  const multipliers = {
    "0x0Fe4F44beE93503346A3Ac9EE5A26b130a5796d6": 100_000,
    "0x13760F50a9d7377e4F20CB8CF9e4c26586c658ff": 100_000,
    "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2": 100_000,
    "0x298aFB19A105D59E74658C4C334Ff360BadE6dd2": 100_000,
    "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc": 100_000,
    "0x57ba429517c3473B6d34CA9aCd56c0e735b94c02": 100_000,
    "0x7CA911E83dabf90C90dD3De5411a10F1A6112184": 100_000,
    "0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6": 100_000,
    "0x93c4b944D05dfe6df7645A86cd2206016c51564D": 100_000,
    "0x9d7eD45EE2E8FC5482fa2428f15C971e6369011d": 100_000,
    "0xa4C637e0F704745D182e4D38cAb7E7485321d059": 100_000,
    "0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7": 80,
    "0xAe60d8180437b5C34bB956822ac2710972584473": 100_000,
    "0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0": 100_000,
    "0x1faea963dffa4aca3b79700a448acc75b1b63c60": 13,
  };

  const params: any[] = [];

  for (const [strategy, multiplier] of Object.entries(multipliers)) {
    params.push({
      stakingContract: strategy,
      multiplier,
      sharedSecurityProvider: 0,
    });
  }

  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "setStakingContractMultiplierBatch",
    args: [
      [
        {
          stakingContract: SKATE_BETA_EL_STRATEGY,
          multiplier: MULTIPLIER,
          sharedSecurityProvider: 0,
        },
      ],
    ],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Set new strategies multiplier: ${L1_EXPLORER}/tx/${txHash}`);
}

main();
