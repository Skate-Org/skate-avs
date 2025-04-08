require("dotenv").config(); // Load environment variables from .env

module.exports = {
  apps: [
    {
      name: "SkateAvs.Node::Aggregator",
      script: "othentic-cli",
      args: [
        "node",
        "aggregator",
        "--json-rpc",
        "--metrics",
        "--delay",
        "2000",
        // "--internal-tasks",
      ],
      interpreter: "none",
      env: {
        PRIVATE_KEY: `${process.env.PRIVATE_KEY_AGGREGATOR}`,
        AVS_GOVERNANCE_ADDRESS: `${process.env.AVS_GOVERNANCE_ADDRESS}`,
        ATTESTATION_CENTER_ADDRESS: `${process.env.ATTESTATION_CENTER_ADDRESS}`,
        L1_RPC: process.env.L1_RPC,
        L2_RPC: process.env.L2_RPC,
        L1_CHAIN: process.env.L1_CHAIN,
        L2_CHAIN: process.env.L2_CHAIN,
      },
    },
  ],
};
