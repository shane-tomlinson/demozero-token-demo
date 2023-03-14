const jwt = require("jsonwebtoken");
const { getEnv } = require("./env");

const getAppClientAuthentication = () => {
  const {
    APP_CLIENT_ID,
    APP_CLIENT_AUTHENTICATION_METHOD,
    APP_CLIENT_SECRET,
    APP_JWTCA_KEY_ID,
    APP_JWTCA_PRIVATE_KEY,
  } = getEnv();
  return clientAuthentication(APP_CLIENT_ID, APP_CLIENT_AUTHENTICATION_METHOD, {
    privateKeyPEM: APP_JWTCA_PRIVATE_KEY,
    clientSecret: APP_CLIENT_SECRET,
    keyid: APP_JWTCA_KEY_ID,
  });
};

const getManagementClientAuthentication = () => {
  const {
    AUTH0_MGMT_CLIENT_ID,
    AUTH0_MGMT_CLIENT_AUTHENTICATION_METHOD,
    AUTH0_MGMT_CLIENT_SECRET,
    AUTH0_MGMT_JWTCA_KEY_ID,
    AUTH0_MGMT_JWTCA_PRIVATE_KEY,
  } = getEnv();
  return clientAuthentication(AUTH0_MGMT_CLIENT_ID, AUTH0_MGMT_CLIENT_AUTHENTICATION_METHOD, {
    privateKeyPEM: AUTH0_MGMT_JWTCA_PRIVATE_KEY,
    clientSecret: AUTH0_MGMT_CLIENT_SECRET,
    keyid: AUTH0_MGMT_JWTCA_KEY_ID,
  });
}

const clientAuthentication = (
  clientID,
  clientAuthenticationMethod,
  clientAuthenticationOptions
) => {
  const { AUTH0_DOMAIN } = getEnv();

  if (clientAuthenticationMethod === "jwtca") {
    console.log("using JWT client authentication");
    if (!clientID) {
      throw new Error('missing clientID')
    }
    const assertion = jwt.sign(
      {
        jti: "" + Date.now(),
        iat: Math.floor(Date.now() / 1000),
      },
      clientAuthenticationOptions.privateKeyPEM,
      {
        audience: `https://${AUTH0_DOMAIN}/`,
        issuer: clientID,
        subject: clientID,
        keyid: clientAuthenticationOptions.keyid,
        algorithm: "RS256",
        expiresIn: "1m",
      }
    );

    return {
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: assertion,
    };
  } else if (clientAuthenticationMethod === "client_secret_post") {
    console.log("using client_secret client authentication");
    return {
      client_secret: clientAuthenticationOptions.clientSecret,
    };
  } else {
    throw new Error("invalid client authentication config");
  }
};


exports.clientAuthentication = clientAuthentication;
exports.getAppClientAuthentication = getAppClientAuthentication;
exports.getManagementClientAuthentication = getManagementClientAuthentication;
