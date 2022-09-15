const axios = require("axios");

const { API2_BASE_URL, API2_AUDIENCE } = require("./constants");
const { getAccessToken } = require("./handlers/auth_api");
const { generateDPoP } = require("./dpop");

let api2Token;
const getToken = async () => {
  if (api2Token && api2Token.expires_at < Date.now()) {
    api2Token = null;
  }

  if (!api2Token) {
    const tokenRequestParams = {
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: API2_AUDIENCE,
    };

    const response = await getAccessToken(tokenRequestParams);
    const expires_at = Date.now() + response.expires_in * 1000;
    console.log({ access_token: response.access_token });
    api2Token = {
      access_token: response.access_token,
      token_type: response.token_type,
      expires_at,
    };
  }

  return api2Token;
};

const makeApi2Request = async (options) => {
  try {
    const { access_token, token_type } = await getToken();

    const method =
      (options && options.method && options.method.toLowerCase()) || "get";

    const url = `${API2_BASE_URL}${options.path}`;
    const config = {
      method,
      url,
      headers: {
        Authorization: `${token_type} ${access_token}`,
        "Content-Type": "application/json",
        DPoP: await generateDPoP(url, method, access_token),
      },
      data: JSON.stringify(options.data),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    const api2Error = new Error(error.message);
    if (error.response) {
      api2Error.data = error.response.data;
    }

    throw api2Error;
  }
};

module.exports = {
  getToken,
  makeApi2Request,
};
