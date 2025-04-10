require("dotenv").config(); // Load environment variables from .env

const isStaging = process.env.ENVIRONMENT === "STAGING";
const prefix = isStaging ? "STAGING - " : "";

module.exports = {
  apps: [
    {
      name: `${prefix}SkateAvs.Indexer::AttestationCenter`,
      script: "dist/services/indexer/exe.js",
      time: true,
    },
  ],
};
