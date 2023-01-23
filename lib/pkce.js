const crypto = require("crypto");
const base64url = require("base64url");

module.exports = {
  generateCodeVerifier() {
    const unencodedVerifier = crypto.randomBytes(32);
    return base64url.encode(unencodedVerifier);
  },

  generateCodeChallengeFromVerifier(codeChallengeMethod, codeChallenge) {
    if (codeChallengeMethod === "plain") {
      return codeChallenge;
    }
    return base64url.encode(crypto.createHash("sha256").update(codeChallenge, "utf-8").digest());
  },
};
