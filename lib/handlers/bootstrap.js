const writeDotEnv = require("update-dotenv");
const { generateKeyPair: generateKeyPairCallback } = require("node:crypto");
const { promisify } = require("node:util");
const { getEnv, setEnv } = require("../env");

const generateKeyPair = promisify(generateKeyPairCallback);

const { makeApi2Request } = require("../api2");
const {
  CLIENT_NAME_FOR_DEMO_APP,
  REQUIRED_SCOPES_FOR_BACKEND_CLIENT,
  APP_RESOURCE_SERVER_IDENTIFIER,
  APP_CALLBACK_URL,
  APP_LOGOUT_URL,
  APP_INITIATE_LOGIN_URL,
  APP_LOGO_URI,
} = require("../constants");

const getClientGrantId = async () => {
  const requestOptions = {
    path: `client-grants?client_id=${process.env.AUTH0_MGMT_CLIENT_ID}&audience=https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  };

  try {
    const response = await makeApi2Request(requestOptions);
    if (response && response.length === 1) {
      return response[0].id;
    }

    // TODO: Better error message
    throw new Error("Could not find client grant");
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const getClientGrant = async (clientGrantId) => {
  const requestOptions = {
    method: "get",
    path: `client-grants`,
  };

  try {
    const resp = await makeApi2Request(requestOptions);
    return resp.find((item) => item.id === clientGrantId);
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grants: ${error.message}`);
  }
};

const setRequiredClientGrant = async (clientGrantId) => {
  const grant = (await getClientGrant(clientGrantId)) || { scope: [] };

  const requestOptions = {
    method: "patch",
    path: `client-grants/${clientGrantId}`,
    data: {
      scope: [...REQUIRED_SCOPES_FOR_BACKEND_CLIENT, ...grant.scope].reduce(
        (scopes, currValue) => {
          if (scopes.indexOf(currValue) === -1) {
            scopes.push(currValue);
          }
          return scopes;
        },
        []
      ),
    },
  };

  try {
    await makeApi2Request(requestOptions);
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while updating client grant: ${error.message}`);
  }
};

const getAppClient = async () => {
  // TODO: Only works if less than 100 clients in a tenant
  const requestOptions = {
    path: "clients?page=0&per_page=100",
  };

  try {
    const response = await makeApi2Request(requestOptions);
    console.log({ response });
    const matchingClient = response.filter(
      (client) => client.name === CLIENT_NAME_FOR_DEMO_APP
    );

    if (matchingClient.length === 0) {
      return;
    }

    return matchingClient[0];
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const generateJWTCAKeypair = async () => {
  const { publicKey, privateKey } = await generateKeyPair("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { publicKey, privateKey };
};

const addKeyToClientCredentials = async (clientId, publicKey) => {
  const requestOptions = {
    method: "post",
    path: `clients/${clientId}/credentials`,
    data: {
      name: `key-${new Date().toISOString()}`,
      credential_type: "public_key",
      pem: publicKey,
    },
  };
  try {
    const response = await makeApi2Request(requestOptions);
    return { kid: response.kid, id: response.id };
  } catch (error) {
    console.error(error);
    console.error(`Error while posting client credential: ${error.message}`);
  }
};

const patchClientToUseJWTCAKey = async (clientId, credentialId) => {
  const requestOptions = {
    method: "PATCH",
    path: `clients/${clientId}`,
    data: {
      token_endpoint_auth_method: null,
      client_authentication_methods: {
        private_key_jwt: {
          credentials: [{ id: credentialId }],
        },
      },
    },
  };
  try {
    await makeApi2Request(requestOptions);
  } catch (error) {
    console.error(error);
    console.error(`Error while patching client for JWTCA: ${error.message}`);
  }
};

const patchClientToUseClientSecret = async (clientId) => {
  const requestOptions = {
    method: "PATCH",
    path: `clients/${clientId}`,
    data: {
      token_endpoint_auth_method: ["client_secret_post"],
      client_authentication_methods: null,
    },
  };
  try {
    await makeApi2Request(requestOptions);
  } catch (error) {
    console.error(error);
    console.error(`Error while patching client for JWTCA: ${error.message}`);
  }
};

const generateNewAppClient = async () => {
  const requestOptions = {
    method: "post",
    path: "clients",
    data: {
      name: CLIENT_NAME_FOR_DEMO_APP,
      description: "Created by orgs demo",
      callbacks: [APP_CALLBACK_URL],
      allowed_logout_urls: [APP_LOGOUT_URL],
      initiate_login_uri: APP_INITIATE_LOGIN_URL,
      logo_uri: APP_LOGO_URI,
      organization_usage: "allow",
      oidc_conformant: true,
    },
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const createAppClient = async () => {
  let appClient = await getAppClient();
  if (!appClient) {
    console.log("Demo app client does not exist. Creating...");
    appClient = await generateNewAppClient();
  }
  return appClient;
};

const getAppResourceServer = async () => {
  const requestOptions = {
    path: `resource-servers/${APP_RESOURCE_SERVER_IDENTIFIER}`,
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    if (error.data.statusCode === 404) {
      // expected if the demo resource server is not already created
      return;
    }
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting resource server: ${error.message}`);
  }
};

const generateNewAppResourceServer = async () => {
  const requestOptions = {
    method: "post",
    path: "resource-servers",
    data: {
      name: APP_RESOURCE_SERVER_IDENTIFIER,
      identifier: APP_RESOURCE_SERVER_IDENTIFIER,
      scopes: [
        { value: "create:foo", description: "create:foo" },
        { value: "read:foo", description: "read:foo" },
        { value: "update:foo", description: "update:foo" },
        { value: "delete:foo", description: "delete:foo" },
      ],
      enforce_policies: true,
      token_dialect: "access_token_authz",
      skip_consent_for_verifiable_first_party_clients: true,
      allow_offline_access: true,
    },
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const createAppResourceServer = async () => {
  let appResourceServer = await getAppResourceServer();
  if (!appResourceServer) {
    console.log("Demo app resource server does not exist. Creating...");
    appResourceServer = await generateNewAppResourceServer();
  }
  return appResourceServer;
};

const bootstrapProcess = async () => {
  console.log(">>> Bootstrapping Demo <<<");
  console.log("----- Get Client Grant");
  const clientGrantId = await getClientGrantId();

  console.log("----- Update Client Grant");
  await setRequiredClientGrant(clientGrantId);

  if (true || !getEnv("APP_CLIENT_ID")) {
    console.log("----- Create App Client");
    const appClient = await createAppClient();
    setEnv("APP_CLIENT_ID", appClient.client_id);
    setEnv("APP_CLIENT_SECRET", appClient.client_secret);
  }

  console.log("----- Create Resource Server");
  await createAppResourceServer();

  if (!getEnv("APP_JWTCA_PUBLIC_KEY")) {
    console.log("--- Generating JWTCA keys");
    const { publicKey, privateKey } = await generateJWTCAKeypair();
    const { kid, id } = await addKeyToClientCredentials(
      resolvedEnv.APP_CLIENT_ID,
      publicKey
    );
    setEnv("APP_JWTCA_PUBLIC_KEY", publicKey);
    setEnv("APP_JWTCA_PRIVATE_KEY", privateKey);
    setEnv("APP_JWTCA_KEY_ID", kid);
    setEnv("APP_JWTCA_CREDENTIAL_ID", id);
  }

  const appClientAuthMethod = getEnv("APP_CLIENT_AUTHENTICATION_METHOD");
  if (appClientAuthMethod === "jwtca") {
    await patchClientToUseJWTCAKey(
      getEnv("APP_CLIENT_ID"),
      getEnv("APP_JWTCA_CREDENTIAL_ID")
    );
  } else if (appClientAuthMethod === "client_secret_post") {
    await patchClientToUseClientSecret(resolvedEnv.APP_CLIENT_ID);
  }

  console.log("!!! REMEMBER TO ADD 127.0.0.1 myapp.com to /etc/hosts !!!");
  console.log(">>> Bootstrap Complete <<<");
};

module.exports = {
  addKeyToClientCredentials,
  createAppClient,
  createAppResourceServer,
  generateJWTCAKeypair,
  getClientGrantId,
  patchClientToUseClientSecret,
  patchClientToUseJWTCAKey,
  setRequiredClientGrant,
  bootstrapProcess,
};
