const crypto = require("crypto");
const { sign } = require("./jwt");
const uuid = require("uuid");
const { getEnv } = require("./env");

exports.getClientAuthenticationParams = async () => {
  const CLIENT_ID = getEnv().APP_CLIENT_ID;
  const CLIENT_SECRET = getEnv().APP_CLIENT_SECRET;
  const JWTCA_KEY_ID = getEnv().JWTCA_KEY_ID;

  if (false && JWTCA_KEY_ID) {
    const jwt = await sign(
      {
        iss: CLIENT_ID,
        sub: CLIENT_ID,
        aud: `https://${getEnv().AUTH0_DOMAIN}/`,
        exp: (Date.now() + 60 * 1000) / 1000,
        jti: uuid.v4()
      },
    );

    return {
      client_id: CLIENT_ID,
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: jwt,
    };
  }
  return {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };
};
