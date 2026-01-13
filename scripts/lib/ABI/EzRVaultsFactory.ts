export const EzRVaultsFactoryAddress =
  "0x55600765a721fAF0812d424463849D4649457578";

export const EzRVaultsFactory_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "underlying", type: "address" },
          { internalType: "address", name: "strategy", type: "address" },
          { internalType: "address", name: "vaultOwner", type: "address" },
          {
            internalType: "address",
            name: "vaultFeeDestination",
            type: "address",
          },
          {
            internalType: "address",
            name: "rewardsDestination",
            type: "address",
          },
          { internalType: "uint256", name: "vaultCooldown", type: "uint256" },
          { internalType: "uint256", name: "vaultFee", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
        ],
        internalType: "struct EzRVaultsFactory.VaultConfig",
        name: "config",
        type: "tuple",
      },
    ],
    name: "createVault",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "InvalidZeroInput", type: "error" },
  { inputs: [], name: "VaultAlreadyCreated", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "vaultId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vaultAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "underlyingToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "underlyingStrategy",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "EzRVaultCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "vaults",
    outputs: [
      { internalType: "contract IEzRVault", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
