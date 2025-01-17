require("dotenv").config(); // Load environment variables from .env

const isStaging = process.env.ENVIRONMENT === "STAGING";
const prefix = isStaging ? "STAGING - " : "";

module.exports = {
  apps: [
    {
      name: `${prefix}SkateAvs.Dashboard.Backend::Indexer`,
      script: "dist/indexer/watch-config.js",
      time: true,
    },
  ],
};
