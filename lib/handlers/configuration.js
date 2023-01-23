const { setEnv } = require("../env");
const _ = require("lodash");

const ALLOWED_CONFIGURATION_PARAMS = [
  "audience",
  "scope",
  "response_type",
  "pkce",
  "pkce_code_challenge_method",
];

const saveConfiguration = (req, res) => {
  const updatedConfiguration = _.pick(req.body, ALLOWED_CONFIGURATION_PARAMS);
  Object.keys(updatedConfiguration).forEach((configurationKey) =>
    setEnv(configurationKey, updatedConfiguration[configurationKey], {
      logging: false,
    })
  );

  setEnv("pkce", !!updatedConfiguration.pkce);
  res.redirect("/");
};

module.exports = {
  saveConfiguration,
};
