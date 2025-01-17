require("dotenv").config(); // Load environment variables from .env

const isStaging = process.env.ENVIRONMENT === "STAGING";
const prefix = isStaging ? "STAGING - " : "";

module.exports = {
  apps: [
    {
      name: `${prefix}SkateAvs.Performer::Input Handler`,
      script: "dist/exe/api/index.js",
      time: true,
    },
    {
      name: `${prefix}SkateAvs.Performer::Watcher`,
      script: "dist/exe/watcher.js",
      time: true,
    },
  ],
};
