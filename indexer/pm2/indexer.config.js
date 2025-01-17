require("dotenv").config(); // Load environment variables from .env

const isStaging = process.env.ENVIRONMENT === "STAGING";
const prefix = isStaging ? "STAGING - " : "";

module.exports = {
  apps: [
    {
      name: `${prefix}SkateAvs.Indexer::Collector.Avs`,
      script: "dist/indexer/avs.process.js",
      time: true,
    },
    {
      name: `${prefix}SkateAvs.Indexer::Collector.Kernel`,
      script: "dist/indexer/kernel.process.js",
      time: true,
    },
    {
      name: `${prefix}SkateAvs.Indexer::Aggregator Hook`,
      script: "dist/p2p/aggregator.hook.js",
      time: true,
    },
  ],
};
