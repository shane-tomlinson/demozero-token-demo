const {
  AUTH_REQUESTED_SCOPES,
  APP_RESOURCE_SERVER_IDENTIFIER,
} = require("../lib/constants");

const resolvedEnv = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  BACKEND_CLIENT_ID: process.env.AUTH0_MGMT_CLIENT_ID,
  BACKEND_CLIENT_SECRET: process.env.AUTH0_MGMT_CLIENT_SECRET,
  audience: APP_RESOURCE_SERVER_IDENTIFIER,
  scope: AUTH_REQUESTED_SCOPES,
  response_type: "code",
};

const getEnv = () => resolvedEnv;

const setEnv = (envVariableName, value) => {
  resolvedEnv[envVariableName] = value;
  console.log("---- updated configuration");
  console.log(resolvedEnv);
};

module.exports = {
  getEnv,
  setEnv,
};
