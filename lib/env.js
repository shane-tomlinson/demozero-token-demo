const writeDotEnv = require("update-dotenv");

const {
  AUTH_REQUESTED_SCOPES,
  APP_CALLBACK_URL,
  APP_RESOURCE_SERVER_IDENTIFIER,
  PKCE_CODE_CHALLENGE_METHODS,
  CLIENT_AUTHENTICATION_METHODS,
  PROMPT_TYPES,
} = require("../lib/constants");

function importKey(envName) {
  return process.env[envName]?.replace(/\\n/g, "\n") || "";
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
  app_client_authentication_method:
    process.env.APP_CLIENT_AUTHENTICATION_METHOD,
  APP_CLIENT_AUTHENTICATION_METHOD:
    process.env.APP_CLIENT_AUTHENTICATION_METHOD,
  APP_JAR_PRIVATE_KEY: importKey("APP_JAR_PRIVATE_KEY"),
  APP_JAR_PUBLIC_KEY: importKey("APP_JAR_PUBLIC_KEY"),
  APP_JAR_KEY_ALG: process.env.APP_JAR_KEY_ALG,
  APP_JAR_KEY_ID: process.env.APP_JAR_KEY_ID,
  APP_JAR_CREDENTIAL_ID: process.env.APP_JAR_CREDENTIAL_ID,
  APP_JWTCA_PRIVATE_KEY: importKey("APP_JWTCA_PRIVATE_KEY"),
  APP_JWTCA_PUBLIC_KEY: importKey("APP_JWTCA_PUBLIC_KEY"),
  APP_JWTCA_KEY_ID: process.env.APP_JWTCA_KEY_ID,
  APP_JWTCA_CREDENTIAL_ID: process.env.APP_JWTCA_CREDENTIAL_ID,
  APP_MTLS_CERTIFICATE: importKey("APP_MTLS_CERTIFICATE"),
  APP_MTLS_PRIVATE_KEY: importKey("APP_MTLS_PRIVATE_KEY"),
  APP_MTLS_PUBLIC_KEY: importKey("APP_MTLS_PUBLIC_KEY"),
  acr_values: process.env.ACR_VALUES,
  claims: process.env.CLAIMS,
  audience: APP_RESOURCE_SERVER_IDENTIFIER,
  authorization_details: '[{"type":"urn:auth0:temp:sca"}]',
  client_authentication_methods_list: Object.values(
    CLIENT_AUTHENTICATION_METHODS
  ),
  jar_enabled: process.env.APP_JAR_ENABLED === "true",
  owp: false,
  par_enabled: process.env.APP_PAR_ENABLED === "true",
  pkce_code_challenge_method_list: PKCE_CODE_CHALLENGE_METHODS,
  pkce_code_challenge_method: "S256",
  pkce: true,
  prompt: [],
  prompt_list: PROMPT_TYPES,
  redirect_uri: APP_CALLBACK_URL,
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
  response_type: "code id_token",
  scope: AUTH_REQUESTED_SCOPES,
  send_authorization_details: false,
};

const getEnv = (envVariableName) => {
  if (typeof envVariableName === "string") {
    return resolvedEnv[envVariableName];
  } else {
    return resolvedEnv;
  }
};

const setEnv = async (envVariableName, value, { write = false } = {}) => {
  resolvedEnv[envVariableName] = value;
  if (write) {
    await writeDotEnv({ [envVariableName]: value });
  }
};

module.exports = {
  getEnv,
  setEnv,
};
