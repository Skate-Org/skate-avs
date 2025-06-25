import * as mcl from "mcl-wasm";

async function main() {
  await mcl.init(mcl.BN_SNARK1);
  mcl.setMapToMode(mcl.BN254);

  const secret = new mcl.Fr();
  secret.setHashOf(
    // NOTE: 32 bytes private key, Change this
    "0xc1faf456f57490f7e7239cf3238d1de1f6ec7fc1c9aafa93c35f5d265321313d",
  );

  // NOTE: Construct identity on BN254 G2
  function g2(): mcl.G2 {
    const g2 = new mcl.G2();
    g2.setStr(
      "1 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b",
    );
    return g2;
  }

  const pubKey = mcl.mul(g2(), secret);
  pubKey.normalize();
  console.log(pubKey.serializeToHexStr());
}

main();
