import { AvsGovernance_ABI } from "../../lib/ABI/AvsGovernance";
import {
  AVS_GOVERNANCE_ADDRESS,
  L1_EXPLORER,
} from "../../lib/const";
import { avsOwnerAccount, l1Client, l1WriteClient } from "../../lib/client";

async function main() {
  // const currentStrategies = await l1Client.readContract({
  //   address: AVS_GOVERNANCE_ADDRESS,
  //   abi: AvsGovernance_ABI,
  //   functionName: "strategies",
  // });
  //
  // const extraStrategies: `0x${string}`[] = [
  //   SKATE_BETA_EL_STRATEGY
  // ];
  // const strategies = [
  //   ...currentStrategies,
  //   ...extraStrategies,
  // ];
  const strategies = [
    ["0x0Fe4F44beE93503346A3Ac9EE5A26b130a5796d6", 0],
    ["0x13760F50a9d7377e4F20CB8CF9e4c26586c658ff", 0],
    ["0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2", 0],
    ["0x298aFB19A105D59E74658C4C334Ff360BadE6dd2", 0],
    ["0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc", 0],
    ["0x57ba429517c3473B6d34CA9aCd56c0e735b94c02", 0],
    ["0x7CA911E83dabf90C90dD3De5411a10F1A6112184", 0],
    ["0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6", 0],
    ["0x93c4b944D05dfe6df7645A86cd2206016c51564D", 0],
    ["0x9d7eD45EE2E8FC5482fa2428f15C971e6369011d", 0],
    ["0xa4C637e0F704745D182e4D38cAb7E7485321d059", 0],
    ["0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7", 0],
    ["0xAe60d8180437b5C34bB956822ac2710972584473", 0],
    ["0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0", 0],
    ["0x1faea963dffa4aca3b79700a448acc75b1b63c60", 0],
  ].map((e) => ({
    stakingContract: e[0] as `0x${string}`,
    sharedSecurityProvider: e[1] as number,
  }));

  strategies.sort((s1, s2) =>
    Number(BigInt(s1.stakingContract) - BigInt(s2.stakingContract)),
  );

  const { request } = await l1Client.simulateContract({
    account: avsOwnerAccount,
    address: AVS_GOVERNANCE_ADDRESS,
    abi: AvsGovernance_ABI,
    functionName: "setSupportedStakingContracts",
    args: [strategies],
  });

  const txHash = await l1WriteClient.writeContract(request);
  console.log(`Set new supported strategies: ${L1_EXPLORER}/tx/${txHash}`);
}

main();
