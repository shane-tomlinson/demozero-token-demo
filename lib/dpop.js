async function getDPoPFunctions() {
  const { default: DPoP, generateKeyPair } = await import("dpop");
  return { DPoP, generateKeyPair };
}

let keypair;
async function getKeypair() {
  if (!keypair) {
    const { generateKeyPair } = await getDPoPFunctions();
    keypair = await generateKeyPair("RS256");
  }
  return keypair;
}

async function generateDPoP(htu, htm, accessToken) {
  const keypair = await getKeypair();
  const { DPoP } = await getDPoPFunctions();
  return DPoP(keypair, htu, htm.toUpperCase(), undefined, accessToken);
}

exports.getKeypair = getKeypair;
exports.generateDPoP = generateDPoP;
