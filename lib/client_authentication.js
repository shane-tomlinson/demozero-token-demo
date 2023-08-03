const jwt = require("jsonwebtoken");
const https = require("node:https");

const { getEnv } = require("./env");
const { CLIENT_AUTHENTICATION_METHODS } = require("./constants");
const setAppClientAuthentication = (reqConfig) => {
  if (!reqConfig) {
    throw new Error("missing reqConfig");
  }
  const {
    APP_CLIENT_ID,
    app_client_authentication_method,
    APP_CLIENT_SECRET,
    APP_JWTCA_KEY_ID,
    APP_JWTCA_PRIVATE_KEY,
    APP_MTLS_CERTIFICATE,
    APP_MTLS_PRIVATE_KEY,
  } = getEnv();

  const { data, headers, httpsAgent } = clientAuthentication(
    APP_CLIENT_ID,
    app_client_authentication_method,
    {
      privateKeyPEM: APP_JWTCA_PRIVATE_KEY,
      clientSecret: APP_CLIENT_SECRET,
      keyid: APP_JWTCA_KEY_ID,
      mtlsClientCertificate: APP_MTLS_CERTIFICATE,
      mtlsPrivateKey: APP_MTLS_PRIVATE_KEY,
    }
  );

  console.log({ data, headers });
  reqConfig.data = {
    ...reqConfig.data,
    ...data,
  };

  reqConfig.headers = {
    ...reqConfig.headers,
    ...headers,
  };

  if (httpsAgent) {
    reqConfig.httpsAgent = httpsAgent;
  } else {
    delete reqConfig;
  }

  return reqConfig;
};

const getManagementClientAuthentication = () => {
  const {
    AUTH0_MGMT_CLIENT_ID,
    AUTH0_MGMT_CLIENT_AUTHENTICATION_METHOD,
    AUTH0_MGMT_CLIENT_SECRET,
    AUTH0_MGMT_JWTCA_KEY_ID,
    AUTH0_MGMT_JWTCA_PRIVATE_KEY,
  } = getEnv();

  const { data } = clientAuthentication(
    AUTH0_MGMT_CLIENT_ID,
    [AUTH0_MGMT_CLIENT_AUTHENTICATION_METHOD],
    {
      privateKeyPEM: AUTH0_MGMT_JWTCA_PRIVATE_KEY,
      clientSecret: AUTH0_MGMT_CLIENT_SECRET,
      keyid: AUTH0_MGMT_JWTCA_KEY_ID,
    }
  );

  return data;
};

const clientAuthentication = (
  clientID,
  clientAuthenticationMethods,
  clientAuthenticationOptions
) => {
  console.log({clientAuthenticationMethods})
  const request = {};

  function addHeaders(headers) {
    for (const [headerName, headerValue] of Object.entries(headers)) {
      request.header ??= {};
      request.header[headerName] = encodeURIComponent(headerValue);
    }
  }

  function addBody(params) {
    for (const [paramName, paramValue] of Object.entries(params)) {
      request.data ??= {};
      request.data[paramName] = paramValue;
    }
  }
  const AUTH0_DOMAIN = getEnv("AUTH0_DOMAIN");

  clientAuthenticationMethods.forEach((clientAuthenticationMethod) => {
    if (clientAuthenticationMethod === CLIENT_AUTHENTICATION_METHODS.CA_NONE) {
      return {};
    } else if (
      clientAuthenticationMethod ===
      CLIENT_AUTHENTICATION_METHODS.PRIVATE_KEY_JWT
    ) {
      console.log("using JWT client authentication");
      if (!clientID) {
        throw new Error("missing clientID");
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

      addBody({
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: assertion,
      });
    } else if (
      clientAuthenticationMethod ===
      CLIENT_AUTHENTICATION_METHODS.CLIENT_SECRET_POST
    ) {
      console.log("using client_secret_post client authentication");

      addBody({
        client_secret: clientAuthenticationOptions.clientSecret,
      });
    } else if (
      clientAuthenticationMethod ===
      CLIENT_AUTHENTICATION_METHODS.CLIENT_SECRET_BASIC
    ) {
      console.log("using client_secret_basic client authentication");
      const credentials = Buffer.from(
        `${clientID}:${clientAuthenticationOptions.clientSecret}`,
        "utf-8"
      ).toString("base64");
      const header = `Basic ${credentials};`;
      addHeaders({
        authorization: header,
      });
    } else if (
      clientAuthenticationMethod === CLIENT_AUTHENTICATION_METHODS.CA_MTLS
    ) {
      console.log("using CA signed mTLS Client Authentication");
      /*
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: clientAuthenticationOptions.mtlsClientCertificate,
      key: clientAuthenticationOptions.mtlsPrivateKey,
    });

    return { httpsAgent };*/
      addHeaders({
        "Client-Certificate": clientAuthenticationOptions.mtlsClientCertificate,
        "Client-Certificate-CA-Verified": "SUCCESS",
      });
    } else if (
      clientAuthenticationMethod ===
      CLIENT_AUTHENTICATION_METHODS.SELF_SIGNED_MTLS
    ) {
      console.log("using self-signed signed mTLS Client Authentication");
      /*
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: clientAuthenticationOptions.mtlsClientCertificate,
      key: clientAuthenticationOptions.mtlsPrivateKey,
    });

    return { httpsAgent };*/

      addHeaders({
        "Client-Certificate": clientAuthenticationOptions.mtlsClientCertificate,
        "Client-Certificate-CA-Verified": "FAILED: this is a multi word reason",
      });
    } else {
      throw new Error("invalid client authentication config");
    }
  });
  return request;
};

exports.clientAuthentication = clientAuthentication;
exports.setAppClientAuthentication = setAppClientAuthentication;
exports.getManagementClientAuthentication = getManagementClientAuthentication;
