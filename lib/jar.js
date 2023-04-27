const jwt = require("jsonwebtoken");
const { getEnv } = require("./env");

const createJARPayload = (params) => {
  const {
    APP_JAR_KEY_ID,
    APP_JAR_PRIVATE_KEY,
    AUTH0_DOMAIN,
  } = getEnv();

  const assertion = jwt.sign(
    {
      ...params,
      jti: "" + Date.now(),
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    APP_JAR_PRIVATE_KEY,
    {
      audience: `https://${AUTH0_DOMAIN}/`,
      issuer: params.client_id,
      subject: params.client_id,
      keyid: APP_JAR_KEY_ID,
      algorithm: "PS256",
      expiresIn: "1m",
    }
  );
  return { request: assertion, client_id: params.client_id };
};

exports.createJARPayload = createJARPayload;