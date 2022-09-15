const jose = require("jose");
console.log({ jose });
async function getDPoPFunctions() {
  const { default: DPoP, generateKeyPair } = await import("dpop");
  return { DPoP, generateKeyPair };
}

let keypair;
async function getKeypair(force = false) {
  if (!keypair || force) {
    const { generateKeyPair } = await getDPoPFunctions();
    keypair = await generateKeyPair("RS256");
  }
  return keypair;
}

async function getKeypairThumbprint(keypair) {
  const jwk = await publicJwk(keypair);
  const thumbprint = await jose.calculateJwkThumbprint(jwk);
  return thumbprint;
}

async function generateDPoP(htu, htm, accessToken) {
  const keypair = await getKeypair();
  const { DPoP } = await getDPoPFunctions();
  return DPoP(keypair, htu, htm.toUpperCase(), undefined, accessToken);
}

/**
 * exports an asymmetric crypto key as bare JWK
 */
async function publicJwk(key) {
  const { kty, e, n, x, y, crv } = await crypto.subtle.exportKey(
    "jwk",
    key.publicKey
  );
  return { kty, crv, e, n, x, y };
}

exports.getKeypairThumbprint = getKeypairThumbprint;
exports.getKeypair = getKeypair;
exports.generateDPoP = generateDPoP;
