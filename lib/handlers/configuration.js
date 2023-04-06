const { setEnv } = require("../env");
const _ = require("lodash");

const ALLOWED_CONFIGURATION_PARAMS = [
  "acr_values",
  "audience",
  "authorization_details",
  "owp",
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

  setEnv("pkce", !!updatedConfiguration.pkce);
  setEnv("send_authorization_details", !!updatedConfiguration.send_authorization_details);
  setEnv("owp", !!updatedConfiguration.owp);
  res.redirect("/");
};

module.exports = {
  saveConfiguration,
};
