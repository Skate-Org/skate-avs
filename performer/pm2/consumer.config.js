require("dotenv").config(); // Load environment variables from .env

const isStaging = process.env.ENVIRONMENT === "STAGING";
const prefix = isStaging ? "STAGING - " : "";

module.exports = {
  apps: [
    {
      name: `${prefix}SkateAvs.Performer::Sender`,
      script: "dist/exe/sender.js",
      time: true,
    },
  ],
};
