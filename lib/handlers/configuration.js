const { setEnv } = require("../env");
const _ = require("lodash");

const ALLOWED_CONFIGURATION_PARAMS = [
  "audience",
  "scope",
  "response_type",
  "pkce",
  "pkce_code_challenge_method",
  "send_authorization_details",
  "authorization_details",
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
  res.redirect("/");
};

module.exports = {
  saveConfiguration,
};
