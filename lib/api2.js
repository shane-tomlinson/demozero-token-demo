const axios = require("axios");

const { API2_BASE_URL, TOKEN_ENDPOINT, API2_AUDIENCE } = require("./constants");

async function getDPoPFunctions() {
  const { default: DPoP, generateKeyPair } = await import("dpop");
  return { DPoP, generateKeyPair };
}

let keypair;
async function getKeypair() {
  if (!keypair) {
    const { generateKeyPair } = await getDPoPFunctions();
    keypair = await generateKeyPair("RS256");
  }
  return keypair;
}

async function generateDPoP(htu, htm, accessToken) {
  const keypair = await getKeypair();
  const { DPoP } = await getDPoPFunctions();
  return DPoP(keypair, htu, htm.toUpperCase(), undefined, accessToken);
}

let api2Token;
const getToken = async () => {
  if (api2Token && api2Token.expires_at < Date.now()) {
    api2Token = null;
  }

  if (!api2Token) {
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
        DPoP: await generateDPoP(TOKEN_ENDPOINT, "post"),
      },
      data: JSON.stringify(tokenRequest),
    };

    const response = await axios(config);
    const expires_at = Date.now() + response.expires_in * 1000;
    api2Token = {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
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
        // TODO - Bearer should be `token_type` when API2 has support.
        Authorization: `Bearer ${access_token}`,
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
