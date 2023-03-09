const {
  getClientGrantId,
  setRequiredClientGrant,
  createAppClient,
  createAppResourceServer,
} = require("./handlers/bootstrap");
const {
  AUTH_REQUESTED_SCOPES,
  APP_CALLBACK_URL,
  APP_RESOURCE_SERVER_IDENTIFIER,
  PKCE_CODE_CHALLENGE_METHODS,
} = require("../lib/constants");

const resolvedEnv = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  BACKEND_CLIENT_ID: process.env.AUTH0_MGMT_CLIENT_ID,
  BACKEND_CLIENT_SECRET: process.env.AUTH0_MGMT_CLIENT_SECRET,
  APP_CLIENT_ID: process.env.APP_CLIENT_ID,
  APP_CLIENT_SECRET: process.env.APP_CLIENT_SECRET,
  audience: APP_RESOURCE_SERVER_IDENTIFIER,
  scope: AUTH_REQUESTED_SCOPES,
  response_type: "code id_token",
  redirect_uri: APP_CALLBACK_URL,
  owp: false,
  pkce: true,
  pkce_code_challenge_method: "S256",
  pkce_code_challenge_method_list: PKCE_CODE_CHALLENGE_METHODS,
  send_authorization_details: false,
  authorization_details: '[{"type":"urn:auth0:temp:sca"}]',
  response_mode: "",
  response_mode_list: [
    "",
    "query",
    "fragment",
    "form_post",
    "jwt",
    "query.jwt",
    "fragment.jwt",
    "form_post.jwt",
    "auth0_owp",
  ],
};

const bootstrapProcess = async () => {
  console.log(">>> Bootstrapping Demo <<<");
  console.log("----- Get Client Grant");
  const clientGrantId = await getClientGrantId();

  console.log("----- Update Client Grant");
  await setRequiredClientGrant(clientGrantId);

  if (!process.env.APP_CLIENT_ID) {
    console.log("----- Create App Client");
    const appClient = await createAppClient();
    resolvedEnv.APP_CLIENT_ID = appClient.client_id;
    resolvedEnv.APP_CLIENT_SECRET = appClient.client_secret;
  }

  console.log("----- Create Resource Server");
  await createAppResourceServer();

  console.log("!!! REMEMBER TO ADD 127.0.0.1 myapp.com to /etc/hosts !!!");
  console.log(">>> Bootstrap Complete <<<");
};
const getEnv = () => resolvedEnv;

const setEnv = (envVariableName, value, options = { logging: true }) => {
  resolvedEnv[envVariableName] = value;
  if (options.logging !== false) {
    console.log("---- updated configuration", resolvedEnv);
  }
};

module.exports = {
  getEnv,
  setEnv,
  bootstrapProcess,
};
