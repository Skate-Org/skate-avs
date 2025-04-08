export const IMessageBox_Shuffle_ABI = [
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
            name: "destChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "vmType",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "actionId",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TaskExecuted",
    inputs: [
      {
        name: "taskId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "IntentIsNotSignedForTheApp",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidIntentSignature",
    inputs: [],
  },
  {
    type: "error",
    name: "NotAnExecutor",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TaskAndIntentUsersDoNotMatch",
    inputs: [],
  },
  {
    type: "error",
    name: "VmNotRegistered",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
] as const;
