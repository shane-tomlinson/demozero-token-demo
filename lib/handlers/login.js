const axios = require("axios");
const url = require("url");
const querystring = require("querystring");
const { makeApi2Request } = require("../api2");
const { getEnv } = require("../env");
const {
  APP_CALLBACK_URL,
  AUTHORIZE_ENDPOINT,
  PAR_ENDPOINT,
} = require("../constants");

const getAuthorizeParams = (req, extras = {}) => ({
  client_id: getEnv().APP_CLIENT_ID,
  response_type: getEnv().response_type,
  redirect_uri: APP_CALLBACK_URL,
  ...(getEnv().audience ? { audience: getEnv().audience } : {}),
  ...(getEnv().scope ? { scope: getEnv().scope } : {}),
  ...(req.query.organization ? { organization: req.query.organization } : {}),
  ...(req.query.invitation ? { invitation: req.query.invitation } : {}),
  ...((getEnv().response_type || "").indexOf("id_token") > -1
    ? { nonce: Math.random() }
    : {}),
  ...extras,
});

const authenticate = (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  console.log(
    `Calling ${APP_CALLBACK_URL} with audience ${getEnv().audience} and scope ${
      getEnv().scope
    }`
  );

  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = getAuthorizeParams(req);

  res.redirect(url.format(authorizeUrl));
};

const authenticateWithRar = (req, res) => {
  console.log(
    `Calling ${APP_CALLBACK_URL} with audience ${getEnv().audience} and scope ${
      getEnv().scope
    }`
  );

  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  console.log({ body: req.body.authorization_details });
  authorizeUrl.query = getAuthorizeParams(req, {
    authorization_details: req.body.authorization_details,
  });

  res.redirect(url.format(authorizeUrl));
};

const authenticateWithPar = async (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  console.log(
    `Calling ${PAR_ENDPOINT} with audience ${getEnv().audience} and scope ${
      getEnv().scope
    }`
  );

  const response = await axios.post(
    PAR_ENDPOINT,
    querystring.stringify({
      ...getAuthorizeParams(req),
      client_secret: getEnv().APP_CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = {
    client_id: getEnv().APP_CLIENT_ID,
    request_uri: response.data.request_uri,
  };

  res.redirect(url.format(authorizeUrl));
};

const parseOrgIdOrName = (reqBody) => {
  const orgNameAndId = (reqBody.organization_id || "").split("|");

  let organizationParam = orgNameAndId[0];
  if (reqBody.sendorgname === "on") {
    organizationParam = orgNameAndId[1];
  }

  return organizationParam;
};

const orgSelection = async (req, res) => {
  const organizationParam = parseOrgIdOrName(req.body);
  res.redirect(`/login?organization=${organizationParam}`);
};

const samlOrgSelection = async (req, res) => {
  const organizationParam = parseOrgIdOrName(req.body);
  res.redirect(`/saml/login?organization=${organizationParam}`);
};

const getOrganizations = async () => {
  const response = await makeApi2Request({
    method: "get",
    path: "organizations?page=0&per_page=100",
  });

  return response.map((organization) => ({
    name: organization.name,
    id: organization.id,
  }));
};

const getConnections = async () => {
  const response = await makeApi2Request({
    method: "get",
    path: "connections?page=0&per_page=100",
  });

  return response.map((connection) => ({
    name: connection.name,
    id: connection.id,
    strategy: connection.strategy,
  }));
};

const getRoles = async () => {
  const response = await makeApi2Request({
    method: "get",
    path: "roles?page=0&per_page=100",
  });

  return response.map((role) => ({
    name: role.name,
    id: role.id,
  }));
};

module.exports = {
  authenticate,
  authenticateWithPar,
  authenticateWithRar,
  orgSelection,
  getOrganizations,
  getRoles,
  getConnections,
  samlOrgSelection,
};
