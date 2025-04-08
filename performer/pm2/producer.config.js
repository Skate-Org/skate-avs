require("dotenv").config(); // Load environment variables from .env

const isStaging = process.env.ENVIRONMENT === "STAGING";
const prefix = isStaging ? "STAGING - " : "";

module.exports = {
  apps: [
    // {
    //   name: `${prefix}SkateAvs.Performer::Input Handler`,
    //   script: "dist/services/api/index.js",
    //   time: true,
    // },
    {
      name: `${prefix}SkateAvs.Performer::Watcher`,
      script: "dist/services/watcher.js",
      time: true,
    },
  ],
};
