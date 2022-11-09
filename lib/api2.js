const axios = require("axios");

const { API2_BASE_URL, TOKEN_ENDPOINT, API2_AUDIENCE } = require("./constants");

let api2Token;

const getToken = async (force = false) => {
  if (!api2Token || force) {
    const tokenRequest = {
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: API2_AUDIENCE,
    };
    const config = {
      method: "post",
      url: TOKEN_ENDPOINT,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(tokenRequest),
    };

    const response = await axios(config);
    api2Token = response.data.access_token;
  }
  return api2Token;
};

const makeApi2Request = async (options) => {
  try {
    const api2Token = await getToken();

    const method =
      (options && options.method && options.method.toLowerCase()) || "get";

    const url = `${API2_BASE_URL}${options.path}`;
    const config = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${api2Token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(options.data),
    };
    console.log({ config });

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
