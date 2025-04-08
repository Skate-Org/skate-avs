import { EnvMode } from "../env";

const PROD_POLYMARKET_MESSAGE_BOX = "0xAf6257d774Ac84cd749f1f47207A9FFe575E12B1";
const STAGING_POLYMARKET_MESSAGE_BOX = "0x8926c029423B1e9D7af9D0B93C0C2cf5354Dc998";

export function polymarketMessageBox(mode: EnvMode) {
  const address = mode == "PRODUCTION" ? PROD_POLYMARKET_MESSAGE_BOX : STAGING_POLYMARKET_MESSAGE_BOX;
  return address as `0x${string}`;
}

const SHUFFLE_MESSAGE_BOX = "0x3a7BD656C8735675bbA3D9b27542030ac2D1C6f4";
export function shuffleMessageBox(mode: EnvMode) {
  const address = mode == "PRODUCTION" ? SHUFFLE_MESSAGE_BOX : SHUFFLE_MESSAGE_BOX;
  return address as `0x${string}`;
}

const AMM_MESSAGE_BOX = "0x24417A21e0092887D4B491a59BE7166590e6c91C";
export function ammMessageBox(mode: EnvMode) {
  const address = mode == "PRODUCTION" ? AMM_MESSAGE_BOX : AMM_MESSAGE_BOX;
  return address as `0x${string}`;
}
