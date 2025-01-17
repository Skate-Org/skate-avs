module.exports = {
  apps: [
    {
      name: "SkateAvs.Web API",
      script: "dist/index.js",
      exec_mode: "fork",
      instances: 1,
      env: {
        ENVIRONMENT: "production",
      },
    },
  ],
};
