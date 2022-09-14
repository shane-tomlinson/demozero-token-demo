const Auth0Strategy = require("passport-auth0");
const { APP_CALLBACK_URL } = require("../constants");
const { getKeypair, generateDPoP } = require("../dpop");
const { getEnv } = require("../env");
const { getAccessToken } = require("../handlers/auth_api");
const axios = require("axios");

module.exports = async () => {
  const keypair = await getKeypair();

  const auth0Strategy = new Auth0Strategy(
    {
      domain: getEnv().AUTH0_DOMAIN,
      clientID: getEnv().APP_CLIENT_ID,
      clientSecret: getEnv().APP_CLIENT_SECRET,
      callbackURL: APP_CALLBACK_URL,
      dpopKeypair: keypair,
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the JWT access token
      // extraParams.id_token is the JWT id token
      // profile has all the information from the user
      extraParams.refresh_token = refreshToken;

      return done(null, {
        profile: profile,
        extraParams: extraParams,
      });
    }
  );

  // Gross, we are reaching deep into passport to override
  // fetching an access token so that we can send DPoP headers.
  auth0Strategy._oauth2.getOAuthAccessToken = function (
    code,
    params = {},
    done
  ) {
    params["client_id"] = this._clientId;
    params["client_secret"] = this._clientSecret;
    var codeParam =
      params.grant_type === "refresh_token" ? "refresh_token" : "code";
    params[codeParam] = code;

    getAccessToken(params).then((results) => {
      var access_token = results["access_token"];
      var refresh_token = results["refresh_token"];
      delete results["refresh_token"];
      done(null, access_token, refresh_token, results);
    }, done);
  };

  // overridden to pass DPoP headers
  auth0Strategy._oauth2.get = async function (url, accessToken, done) {
    const config = {
      method: "get",
      url,
      headers: {
        "Content-Type": "application/json",
        authorization: `DPoP ${accessToken}`,
        DPoP: await generateDPoP(url, "get", accessToken),
      },
      json: false,
    };
    try {
      const response = await axios(config);
      // Is it possible to prevent axios from parsing the response?
      done(null, JSON.stringify(response.data));
    } catch (err) {
      done(err);
    }
  };

  return auth0Strategy;
};
