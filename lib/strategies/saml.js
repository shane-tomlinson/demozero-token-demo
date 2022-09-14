const SamlStrategy = require("passport-wsfed-saml2").Strategy;
const { getEnv } = require("../env");

module.exports = async () => {
  const samlStrategy = new SamlStrategy(
    {
      protocol: "samlp",
      realm: "urn:test-app",
      path: "/saml/callback",
      identityProviderUrl: `https://${getEnv().AUTH0_DOMAIN}/samlp/${
        getEnv().SAML_APP_CLIENT_ID
      }`,
      cert: getEnv().SAML_CERT,
    },
    (profile, done) => {
      return done(null, {
        profile: profile,
      });
    }
  );

  return samlStrategy;
};
