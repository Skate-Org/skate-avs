import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

const ETHEREUM_RPC = process.env.ETHEREUM_RPC as `string`;
if (!ETHEREUM_RPC) {
  throw new Error(
    "Ethereum RPC not set. Please fill in `ETHEREUM_RPC` in `.env`",
  );
}

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) {
  throw new Error(
    "Private key not set. Please fill in `PRIVATE_KEY` in `.env`",
  );
}

const SKATE_TOKEN_ADDRESS = process.env.SKATE_TOKEN_ADDRESS as `0x${string}`;
if (!SKATE_TOKEN_ADDRESS) {
  throw new Error(
    "Skate Token Address not set. Please fill in `SKATE_TOKEN_ADDRESS` in `.env`",
  );
}

export const readClient = createPublicClient({
  transport: http(ETHEREUM_RPC),
});

export const writeClient = createWalletClient({
  transport: http(ETHEREUM_RPC),
});

export const avsOwnerAccount = privateKeyToAccount(PRIVATE_KEY);

const EigenLayerStrategyFactoryAddress =
  "0x5e4C39Ad7A3E881585e383dB9827EB4811f6F647";
const EigenLayerStrategyFactoryABI = parseAbi([
  "function deployNewStrategy(address token) external returns (address)",
]);

async function main() {
  const { request } = await readClient.simulateContract({
    account: avsOwnerAccount,
    address: EigenLayerStrategyFactoryAddress,
    abi: EigenLayerStrategyFactoryABI,
    functionName: "deployNewStrategy",
    args: [SKATE_TOKEN_ADDRESS],
  });

  const hash = await writeClient.writeContract(request);
  console.log(`Tx sent: https://etherscan.io/tx/${hash}`);

  console.log(`Waiting...`);
  await readClient.waitForTransactionReceipt({ hash: hash });
  console.log(`Done!`);
}

main();
