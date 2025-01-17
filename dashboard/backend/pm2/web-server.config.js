require("dotenv").config(); // Load environment variables from .env

const isStaging = process.env.ENVIRONMENT === "STAGING";
const prefix = isStaging ? "STAGING - " : "";

module.exports = {
  apps: [
    {
      name: `${prefix}SkateAvs.Dashboard.Backend::Web Server`,
      script: "dist/web-server/index.js",
      time: true,
    },
  ],
};
