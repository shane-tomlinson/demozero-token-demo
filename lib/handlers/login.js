const axios = require("axios");
const url = require("url");
const querystring = require("querystring");
const uuid = require("uuid");
const { makeApi2Request } = require("../api2");
const { getEnv } = require("../env");
const {
  APP_CALLBACK_URL,
  AUTHORIZE_ENDPOINT,
  PAR_ENDPOINT,
} = require("../constants");

const pkce = require("../pkce");

const getAuthorizeParams = (req, extras = {}) => {
  const {
    scope,
    APP_CLIENT_ID,
    response_type,
    audience,
    pkce: isPKCEEnabled,
    pkce_code_challenge_method,
  } = getEnv();

  if (req.query.scalogin) {
    scope += `${scope || ""} urn:auth0:temp:sca`;
  }

  let pkceParams = {};

  if (isPKCEEnabled) {
    pkceParams.code_challenge_method = pkce_code_challenge_method;
    const codeVerifier = pkce.generateCodeVerifier();
    req.session.code_verifier = codeVerifier;

    pkceParams.code_challenge = pkce.generateCodeChallengeFromVerifier(
      pkce_code_challenge_method,
      codeVerifier
    );
  }

  return {
    client_id: APP_CLIENT_ID,
    response_type: response_type,
    redirect_uri: APP_CALLBACK_URL,
    state: uuid.v4(),
    ...(audience ? { audience } : {}),
    ...(scope ? { scope } : {}),
    ...(req.query.organization ? { organization: req.query.organization } : {}),
    ...(req.query.invitation ? { invitation: req.query.invitation } : {}),
    ...((response_type || "").indexOf("id_token") > -1
      ? { nonce: Math.random() }
      : {}),
    ...pkceParams,
    ...extras,
  };
};

const authenticate = (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = getAuthorizeParams(req);
  console.log(`Calling ${APP_CALLBACK_URL} with ${authorizeUrl.query}`);

  res.redirect(url.format(authorizeUrl));
};

const authenticateWithRar = (req, res) => {
  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = getAuthorizeParams(req, {
    authorization_details: req.body.authorization_details,
  });
  console.log(`Calling ${APP_CALLBACK_URL} with ${authorizeUrl.query}`);

  res.redirect(url.format(authorizeUrl));
};

const authenticateWithPar = async (req, res) => {
  // TODO: Passport or our SDK needs updated to include organization
  console.log(
    `Calling ${PAR_ENDPOINT} with audience ${getEnv().audience} and scope ${
      getEnv().scope
    }`
  );

  console.log({ body: req.body.authorization_details });
  let response;
  try {
    response = await axios.post(
      PAR_ENDPOINT,
      querystring.stringify({
        ...getAuthorizeParams(req, {
          authorization_details: req.body.authorization_details,
        }),
        client_secret: getEnv().APP_CLIENT_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  } catch (error) {
    const callbackUrl = url.parse(APP_CALLBACK_URL);
    const body = error.response.data;
    callbackUrl.query = {
      error: body.error,
      error_description: body.error_description,
    };

    return res.redirect(url.format(callbackUrl));
  }
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
