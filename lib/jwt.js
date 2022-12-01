const jsonwebtoken = require("jsonwebtoken");
const util = require("util");
const path = require("path");
const fs = require("fs");
const { getEnv } = require("./env");

const sign = util.promisify(jsonwebtoken.sign);

const certificateData = fs.readFileSync(
  path.join(__dirname, "..", "keys", "test_key.pem"),
  "utf-8"
);

exports.sign = (payload, options = {}) => {
  const headerOptions = {
    ...(options.header ?? {}),
    kid: getEnv().JWTCA_KEY_ID,
  };

  return sign(payload, certificateData, {
    ...options,
    algorithm: options.algorithm ?? 'RS256',
    header: headerOptions,
  });
};
