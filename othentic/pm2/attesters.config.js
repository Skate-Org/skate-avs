require("dotenv").config(); // Load environment variables from .env

module.exports = {
  apps: [
    {
      name: "SkateAvs.Node::Attester 1",
      script: "othentic-cli",
      interpreter: "none",
      args: [
        "node",
        "attester",
        `/ip4/127.0.0.1/tcp/9876/p2p/${process.env.OTHENTIC_BOOTSTRAP_ID}`,
        "--avs-webapi",
        "http://localhost",
        "--avs-webapi-port",
        "4002",
      ],
      env: {
        PRIVATE_KEY: `${process.env.PRIVATE_KEY_VALIDATOR1}`,
        L1_RPC: process.env.L1_RPC,
        L2_RPC: process.env.L2_RPC,
        L1_CHAIN: process.env.L1_CHAIN,
        L2_CHAIN: process.env.L2_CHAIN,
        OPERATOR_ADDRESS: process.env.VALIDATOR_1,
      },
    },
    {
      name: "SkateAvs.Node::Attester 2",
      script: "othentic-cli",
      interpreter: "none",
      args: [
        "node",
        "attester",
        `/ip4/127.0.0.1/tcp/9876/p2p/${process.env.OTHENTIC_BOOTSTRAP_ID}`,
        "--avs-webapi",
        "http://localhost",
        "--avs-webapi-port",
        "4002",
      ],
      env: {
        PRIVATE_KEY: `${process.env.PRIVATE_KEY_VALIDATOR2}`,
        L1_RPC: process.env.L1_RPC,
        L2_RPC: process.env.L2_RPC,
        L1_CHAIN: process.env.L1_CHAIN,
        L2_CHAIN: process.env.L2_CHAIN,
        OPERATOR_ADDRESS: process.env.VALIDATOR_2,
      }
    },
    {
      name: "SkateAvs.Node::Attester 3",
      script: "othentic-cli",
      interpreter: "none",
      args: [
        "node",
        "attester",
        `/ip4/127.0.0.1/tcp/9876/p2p/${process.env.OTHENTIC_BOOTSTRAP_ID}`,
        "--avs-webapi",
        "http://localhost",
        "--avs-webapi-port",
        "4002",
      ],
      env: {
        PRIVATE_KEY: `${process.env.PRIVATE_KEY_VALIDATOR3}`,
        L1_RPC: process.env.L1_RPC,
        L2_RPC: process.env.L2_RPC,
        L1_CHAIN: process.env.L1_CHAIN,
        L2_CHAIN: process.env.L2_CHAIN,
        OPERATOR_ADDRESS: process.env.VALIDATOR_3,
      }
    },
  ],
};
