const axios = require("axios");

const {
  USERINFO_ENDPOINT,
  TOKEN_ENDPOINT,
  AUTH_REQUESTED_SCOPES,
  APP_CALLBACK_URL,
} = require("../constants");
const { getEnv } = require("../env");
const { setAppClientAuthentication } = require("../client_authentication");

const getUserInfo = async (accessToken) => {
  const config = {
    method: "GET",
    url: USERINFO_ENDPOINT,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    json: true,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("error fetching userinfo", {
      status: error.response.status,
      data: error.response.data,
      statusText: error.response.statusText,
      errorText:
        error.response.headers["www-authenticate"] || error.response.body,
    });
    throw error;
  }
};

const getAccessTokenFromCode = async (authorizationCode, params = {}) => {
  const APP_CLIENT_ID = getEnv("APP_CLIENT_ID");

  const config = setAppClientAuthentication({
    method: "POST",
    url: TOKEN_ENDPOINT,
    headers: { "content-type": "application/json" },
    data: {
      ...params,
      grant_type: "authorization_code",
      client_id: APP_CLIENT_ID,
      code: authorizationCode,
      redirect_uri: APP_CALLBACK_URL,
    },
    json: true,
  });

  const response = await axios(config);
  return response.data;
};

const getRefreshToken = async (refreshToken) => {
  const config = setAppClientAuthentication({
    method: "POST",
    url: TOKEN_ENDPOINT,
    headers: { "content-type": "application/json" },
    data: {
      grant_type: "refresh_token",
      client_id: getEnv("APP_CLIENT_ID"),
      refresh_token: refreshToken,
      scope: AUTH_REQUESTED_SCOPES,
    },
    json: true,
  });

  const response = await axios(config);
  return response.data;
};

module.exports = {
  getUserInfo,
  getRefreshToken,
  getAccessTokenFromCode,
};
