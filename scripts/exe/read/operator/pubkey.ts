import * as mcl from "mcl-wasm";

async function main() {
  await mcl.init(mcl.BN_SNARK1);
  mcl.setMapToMode(mcl.BN254);

  // Define 4 BigInt values for the G2 point coordinates (x.a, x.b, y.a, y.b)
  const xa: bigint =
    20677126120312783599399685543744367494160909844219668534303135639284080655390n;
  const xb: bigint =
    17177113503003798864229658610492663153869266228492122365190666327125924495022n;
  const ya: bigint =
    3381369354197627736330350881532772920117553545434440481881319701751618035682n;
  const yb: bigint =
    4084817173888310701170633975150462180933608346887750476850839972119025145233n;

  // Construct the G2 point
  const pointG2 = new mcl.G2();

  // Set the coordinates using the string format "1 <x.a> <x.b> <y.a> <y.b>"
  // Source format: https://github.com/herumi/mcl/blob/master/api.md#set-string
  const pointStr = `1 ${xa.toString()} ${xb.toString()} ${ya.toString()} ${yb.toString()}`;

  try {
    pointG2.setStr(pointStr, 10); // Use base 10 for the input strings

    // Check if the point is valid (on the curve)
    if (!pointG2.isValid()) {
      console.error(
        "Error: The constructed point is not valid (not on the G2 curve).",
      );
    }

    const serializedPoint: Uint8Array = pointG2.serialize();

    const hexString = Buffer.from(serializedPoint).toString("hex");

    console.log("Constructed G2 point (Hex):", hexString);
  } catch (e) {
    console.error("Error setting or serializing G2 point:", e);
    console.error("Input string:", pointStr);
  }
}

main();
