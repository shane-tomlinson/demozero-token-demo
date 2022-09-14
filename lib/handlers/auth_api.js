const {
  USERINFO_ENDPOINT,
  TOKEN_ENDPOINT,
  AUTH_REQUESTED_SCOPES,
} = require("../constants");

const { getEnv } = require("../env");

const { generateDPoP } = require("../dpop");

const axios = require("axios");

const getUserInfo = async (accessToken) => {
  const config = {
    method: "GET",
    url: USERINFO_ENDPOINT,
    headers: {
      "content-type": "application/json",
      // TODO - Bearer should be `DPoP` when supported.
      Authorization: `Bearer ${accessToken}`,
      DPoP: await generateDPoP(USERINFO_ENDPOINT, "get", accessToken),
    },
    json: true,
  };

  const response = await axios(config);
  return response.data;
};

const getAccessToken = async (params = {}) => {
  const tokenRequest = {
    ...params,
  };
  const config = {
    method: "post",
    url: TOKEN_ENDPOINT,
    headers: {
      "Content-Type": "application/json",
      DPoP: await generateDPoP(TOKEN_ENDPOINT, "post"),
    },
    data: JSON.stringify(tokenRequest),
  };

  const response = await axios(config);
  return response;
};

const getRefreshToken = async (refreshToken, accessToken) => {
  const config = {
    method: "POST",
    url: TOKEN_ENDPOINT,
    headers: {
      "content-type": "application/json",
      DPoP: await generateDPoP(TOKEN_ENDPOINT, "post", accessToken),
    },
    data: {
      grant_type: "refresh_token",
      client_id: `${getEnv().APP_CLIENT_ID}`,
      client_secret: `${getEnv().APP_CLIENT_SECRET}`,
      refresh_token: refreshToken,
      scope: AUTH_REQUESTED_SCOPES,
    },
    json: true,
  };

  const response = await axios(config);
  return response.data;
};

module.exports = {
  getAccessToken,
  getUserInfo,
  getRefreshToken,
};
