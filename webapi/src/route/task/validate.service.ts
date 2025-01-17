export async function validateProofOfTask(proofOfTask: string) {
  try {
    // TODO: Check against the proof of task (a cID of data blob submitted to DA)
    //
    return true;
  } catch (err: any) {
    console.error(err?.message);
    return false;
  }
}
