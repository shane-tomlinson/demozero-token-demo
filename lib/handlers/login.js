const axios = require("axios");
const url = require("url");
const querystring = require("node:querystring");
const uuid = require("uuid");

const { getEnv } = require("../env");
const {
  APP_CALLBACK_URL,
  AUTHORIZE_ENDPOINT,
  PAR_ENDPOINT,
} = require("../constants");
const { setAppClientAuthentication } = require("../client_authentication");
const { createJARPayload } = require("../jar");
const pkce = require("../pkce");

function maybeValue(value, name) {
  if (value) {
    return { [name]: value };
  }
  return {};
}

function maybeArrayMaybeValue(value, name) {
  if (Array.isArray(value)) {
    return { [name]: value.join(" ") };
  }
  return maybeValue(value, name);
}

function maybeJSONValue(value, name) {
  if (value) {
    /*   let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // ignore
    }*/
    return { [name]: value };
  }
  return {};
}

const getAuthorizeParams = (req, extras = {}) => {
  const {
    APP_CLIENT_ID,
    acr_values,
    audience,
    authorization_details,
    claims,
    login_hint,
    owp,
    pkce_code_challenge_method,
    pkce: isPKCEEnabled,
    prompt,
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

  const authorizeParams = {
    ...(acr_values ? { acr_values: acr_values.split(/,/g) } : {}),
    ...maybeValue(audience, "audience"),
    ...maybeValue(nonce, "nonce"),
    ...maybeValue(!!owp, "owp"),
    ...maybeValue(req.query.invitation, "invitation"),
    ...maybeValue(req.query.organization, "organization"),
    ...maybeValue(response_mode, "response_mode"),
    ...maybeValue(login_hint, "login_hint"),
    ...maybeValue(scope, "scope"),
    ...authorizationDetailsParams,
    ...pkceParams,
    ...maybeJSONValue(claims, "claims"),
    ...maybeArrayMaybeValue(prompt, "prompt"),
    client_id: APP_CLIENT_ID,
    redirect_uri,
    response_type,
    state,
    ...extras,
  };

  if (getEnv("jar_enabled")) {
    return createJARPayload(authorizeParams);
  }

  return authorizeParams;
};

const authenticate = (req, res) => {
  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = getAuthorizeParams(req);
  console.log(
    `Calling ${AUTHORIZE_ENDPOINT} with ${JSON.stringify(authorizeUrl.query)}`
  );

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
    const authorizeParams = getAuthorizeParams(req);
    const config = setAppClientAuthentication({
      method: "POST",
      url: PAR_ENDPOINT,
      data: {
        ...authorizeParams,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      json: false,
    });
    config.data = querystring.stringify(config.data);
    response = await axios(config);
  } catch (error) {
    const callbackUrl = url.parse(APP_CALLBACK_URL);
    const body = error.response?.data || error;
    console.log({ statusCode: error.response?.status, response: body });
    callbackUrl.query = {
      error: body.error,
      error_description: body.error_description,
      state: req.session.state,
    };

    return res.redirect(url.format(callbackUrl));
  }
  const authorizeUrl = url.parse(AUTHORIZE_ENDPOINT);
  authorizeUrl.query = {
    client_id: getEnv("APP_CLIENT_ID"),
    request_uri: response.data.request_uri,
  };

  res.redirect(url.format(authorizeUrl));
};

module.exports = {
  authenticate,
  authenticateWithPar,
};
