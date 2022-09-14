const Auth0Strategy = require("passport-auth0");
const { APP_CALLBACK_URL } = require("../constants");
const { getKeypair } = require("../dpop");
const { getEnv } = require("../env");
const { getAccessToken } = require("../handlers/auth_api");

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

  try {
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
  } catch (err) {
    console.error("uh oh");
  }

  return auth0Strategy;
};
