const jwt = require("jsonwebtoken");
const { getEnv } = require("./env");

let assertion, useUntil;

const createJARPayload = (params) => {
  const client_id = params.client_id;
  if (assertion && useUntil > Date.now()) {
    return { request: assertion, client_id };
  }

  const { APP_JAR_KEY_ID, APP_JAR_PRIVATE_KEY, AUTH0_DOMAIN } = getEnv();

  assertion = jwt.sign(
    {
      ...params,
      jti: "" + Date.now(),
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    APP_JAR_PRIVATE_KEY,
    {
      audience: `https://${AUTH0_DOMAIN}/`,
      issuer: client_id,
      subject: client_id,
      keyid: APP_JAR_KEY_ID,
      algorithm: "PS256",
      expiresIn: "1m",
    }
  );
  useUntil = Date.now() + 60 * 1000;
  return { request: assertion, client_id };
};

exports.createJARPayload = createJARPayload;
