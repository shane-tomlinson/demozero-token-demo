const jwt = require("jsonwebtoken");
const { getEnv } = require("./env");

const createJARPayload = (params) => {
  const {
    APP_CLIENT_ID,
    APP_JWTCA_KEY_ID,
    APP_JWTCA_PRIVATE_KEY,
    AUTH0_DOMAIN,
  } = getEnv();

  const assertion = jwt.sign(
    {
      ...params,
      jti: "" + Date.now(),
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    APP_JWTCA_PRIVATE_KEY,
    {
      audience: `https://${AUTH0_DOMAIN}/`,
      issuer: APP_CLIENT_ID,
      subject: APP_CLIENT_ID,
      keyid: APP_JWTCA_KEY_ID,
      algorithm: "PS256",
      expiresIn: "1m",
    }
  );
  return { request: assertion, client_id: APP_CLIENT_ID };
};

exports.createJARPayload = createJARPayload;