export const IMessageBox_AMM_ABI = [
  {
    type: "event",
    name: "TaskSubmitted",
    inputs: [
      {
        name: "taskId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "task",
        type: "tuple",
        indexed: false,
        internalType: "struct IMessageBox.Task",
        components: [
          {
            name: "appAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "taskCalldata",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "value",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "user",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "srcChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "srcVmType",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "destChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "destVmType",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "actionId",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
      },
      {
        name: "skateApp",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
