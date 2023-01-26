const axios = require("axios");
const url = require("url");
const querystring = require("querystring");
const uuid = require("uuid");
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
    send_authorization_details: isRAREnabled,
    authorization_details,
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

  const state = uuid.v4();
  req.session.state = state;

  let nonce;
  if ((response_type || "").indexOf("id_token") > -1) {
    nonce = uuid.v4();
    req.session.nonce = nonce;
  }

  let authorizationDetailsParams = {};
  if (isRAREnabled) {
    authorizationDetailsParams = {
      authorization_details,
    };
  }

  return {
    client_id: APP_CLIENT_ID,
    response_type,
    redirect_uri: APP_CALLBACK_URL,
    state,
    ...(audience ? { audience } : {}),
    ...(scope ? { scope } : {}),
    ...(req.query.organization ? { organization: req.query.organization } : {}),
    ...(req.query.invitation ? { invitation: req.query.invitation } : {}),
    ...(nonce ? { nonce } : {}),
    ...pkceParams,
    ...authorizationDetailsParams,
    ...extras,
  };
};

const authenticate = (req, res) => {
  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = getAuthorizeParams(req);
  console.log(`Calling ${APP_CALLBACK_URL} with ${authorizeUrl.query}`);

  res.redirect(url.format(authorizeUrl));
};

const authenticateWithPar = async (req, res) => {
  console.log(
    `Calling ${PAR_ENDPOINT} with audience ${getEnv().audience} and scope ${
      getEnv().scope
    }`
  );

  let response;
  try {
    response = await axios.post(
      PAR_ENDPOINT,
      querystring.stringify({
        ...getAuthorizeParams(req),
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

module.exports = {
  authenticate,
  authenticateWithPar,
};
