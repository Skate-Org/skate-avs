import "dotenv/config";

export type EnvMode = "PRODUCTION" | "STAGING";
export const MODE = process.env.ENVIRONMENT as EnvMode; // STAGING | PRODUCTION
