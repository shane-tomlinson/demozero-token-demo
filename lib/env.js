const writeDotEnv = require("update-dotenv");

const {
  AUTH_REQUESTED_SCOPES,
  APP_CALLBACK_URL,
  APP_RESOURCE_SERVER_IDENTIFIER,
  PKCE_CODE_CHALLENGE_METHODS,
} = require("../lib/constants");

function importKey(envName) {
  return process.env[envName].replace(/\\n/g, "\n");
}

const resolvedEnv = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_MGMT_CLIENT_ID: process.env.AUTH0_MGMT_CLIENT_ID,
  AUTH0_MGMT_CLIENT_SECRET: process.env.AUTH0_MGMT_CLIENT_SECRET,
  AUTH0_MGMT_CLIENT_AUTHENTICATION_METHOD:
    process.env.AUTH0_MGMT_CLIENT_AUTHENTICATION_METHOD,
  AUTH0_MGMT_JWTCA_PRIVATE_KEY: importKey("AUTH0_MGMT_JWTCA_PRIVATE_KEY"),
  AUTH0_MGMT_JWTCA_PUBLIC_KEY: importKey("AUTH0_MGMT_JWTCA_PUBLIC_KEY"),
  AUTH0_MGMT_JWTCA_KEY_ID: process.env.AUTH0_MGMT_JWTCA_KEY_ID,
  AUTH0_MGMT_JWTCA_CREDENTIAL_ID: process.env.AUTH0_MGMT_JWTCA_CREDENTIAL_ID,
  APP_CLIENT_ID: process.env.APP_CLIENT_ID,
  APP_CLIENT_SECRET: process.env.APP_CLIENT_SECRET,
  APP_CLIENT_AUTHENTICATION_METHOD:
    process.env.APP_CLIENT_AUTHENTICATION_METHOD,
  APP_JWTCA_PRIVATE_KEY: importKey("APP_JWTCA_PRIVATE_KEY"),
  APP_JWTCA_PUBLIC_KEY: importKey("APP_JWTCA_PUBLIC_KEY"),
  APP_JWTCA_KEY_ID: process.env.APP_JWTCA_KEY_ID,
  APP_JWTCA_CREDENTIAL_ID: process.env.APP_JWTCA_CREDENTIAL_ID,
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

const getEnv = () => resolvedEnv;

const setEnv = (envVariableName, value) => {
  resolvedEnv[envVariableName] = value;
  //writeDotEnv({ [envVariableName]: value });
};

module.exports = {
  getEnv,
  setEnv,
};
