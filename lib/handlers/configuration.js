const { setEnv } = require("../env");
const _ = require("lodash");

const ALLOWED_CONFIGURATION_PARAMS = [
  "acr_values",
  "app_client_authentication_method",
  "audience",
  "authorization_details",
  "claims",
  "jar_enabled",
  "owp",
  "par_enabled",
  "pkce_code_challenge_method",
  "pkce",
  "redirect_uri",
  "response_mode",
  "response_type",
  "scope",
  "send_authorization_details",
];

const saveConfiguration = (req, res) => {
  const updatedConfiguration = _.pick(req.body, ALLOWED_CONFIGURATION_PARAMS);
  Object.keys(updatedConfiguration).forEach((configurationKey) =>
    setEnv(configurationKey, updatedConfiguration[configurationKey], {
      logging: false,
    })
  );

  setEnv("jar_enabled", !!updatedConfiguration.jar_enabled);
  setEnv("owp", !!updatedConfiguration.owp);
  setEnv("par_enabled", !!updatedConfiguration.par_enabled);
  setEnv("pkce", !!updatedConfiguration.pkce);
  setEnv(
    "send_authorization_details",
    !!updatedConfiguration.send_authorization_details
  );
  res.redirect("/");
};

module.exports = {
  saveConfiguration,
};
