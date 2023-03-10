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
    APP_CLIENT_ID,
    audience,
    authorization_details,
    owp,
    pkce_code_challenge_method,
    pkce: isPKCEEnabled,
    redirect_uri,
    response_mode,
    response_type,
    scope,
    send_authorization_details: isRAREnabled,
  } = getEnv();

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
    ...(audience ? { audience } : {}),
    ...(nonce ? { nonce } : {}),
    ...(owp ? { owp: true } : {}),
    ...(req.query.invitation ? { invitation: req.query.invitation } : {}),
    ...(req.query.organization ? { organization: req.query.organization } : {}),
    ...(response_mode ? { response_mode } : {}),
    ...(scope ? { scope } : {}),
    ...authorizationDetailsParams,
    ...pkceParams,
    client_id: APP_CLIENT_ID,
    redirect_uri,
    response_type,
    state,
    ...extras,
  };
};

const authenticate = (req, res) => {
  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = getAuthorizeParams(req);
  console.log(`Calling ${AUTHORIZE_ENDPOINT} with ${authorizeUrl.query}`);

  res.redirect(url.format(authorizeUrl));
};

const authenticateWithPar = async (req, res) => {
  console.log(
    `Calling ${PAR_ENDPOINT} with ${JSON.stringify(
      getAuthorizeParams(req),
      null,
      2
    )}`
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
    console.log({ statusCode: error.response.status, response: body });
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
