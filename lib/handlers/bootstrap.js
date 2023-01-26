const axios = require('axios');

const { makeApi2Request } = require('../api2');
const {
  CLIENT_NAME_FOR_DEMO_APP,
  CLIENT_NAME_FOR_SAML_DEMO_APP,
  REQUIRED_SCOPES_FOR_BACKEND_CLIENT,
  APP_RESOURCE_SERVER_IDENTIFIER,
  APP_CALLBACK_URL,
  SAML_APP_CALLBACK_URL,
  APP_LOGOUT_URL,
  APP_INITIATE_LOGIN_URL,
  APP_LOGO_URI,
  DEMO_ORG_NAME,
  DEMO_ORG_DISPLAY_NAME,
  DEMO_ORG_LOGO_URI,
  DEMO_ORG_PRIMARY_COLOR,
  DEMO_ORG_BACKGROUND_COLOR,
  GOOGLE_CONNECTION_NAME,
  DEMO_ROLE_NAME_PREFIX,
  DEMO_CONNECTION_NAME,
} = require('../constants');

const getClientGrantId = async () => {
  const requestOptions = {
    path: `client-grants?client_id=${process.env.AUTH0_MGMT_CLIENT_ID}&audience=https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  };

  try {
    const response = await makeApi2Request(requestOptions);
    if (response && response.length === 1) {
      return response[0].id;
    }

    // TODO: Better error message
    throw new Error('Could not find client grant');
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const setRequiredClientGrant = async (clientGrantId) => {
  const requestOptions = {
    method: 'patch',
    path: `client-grants/${clientGrantId}`,
    data: {
      scope: REQUIRED_SCOPES_FOR_BACKEND_CLIENT,
    },
  };

  try {
    await makeApi2Request(requestOptions);
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const getAppClient = async () => {
  // TODO: Only works if less than 100 clients in a tenant
  const requestOptions = {
    path: 'clients?page=0&per_page=100',
  };

  try {
    const response = await makeApi2Request(requestOptions);

    const matchingClient = response.filter((client) => client.name === CLIENT_NAME_FOR_DEMO_APP);

    if (matchingClient.length === 0) {
      return;
    }

    return matchingClient[0];
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const generateNewAppClient = async () => {
  const requestOptions = {
    method: 'post',
    path: 'clients',
    data: {
      name: CLIENT_NAME_FOR_DEMO_APP,
      description: 'Created by orgs demo',
      callbacks: [APP_CALLBACK_URL],
      allowed_logout_urls: [APP_LOGOUT_URL],
      initiate_login_uri: APP_INITIATE_LOGIN_URL,
      logo_uri: APP_LOGO_URI,
      organization_usage: 'allow',
      oidc_conformant: true,
    },
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const createAppClient = async () => {
  let appClient = await getAppClient();
  if (!appClient) {
    console.log('Demo app client does not exist. Creating...');
    appClient = await generateNewAppClient();
  }
  return appClient;
};

const getAppResourceServer = async () => {
  const requestOptions = {
    path: `resource-servers/${APP_RESOURCE_SERVER_IDENTIFIER}`,
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    if (error.data.statusCode === 404) {
      // expected if the demo resource server is not already created
      return;
    }
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting resource server: ${error.message}`);
  }
};

const generateNewAppResourceServer = async () => {
  const requestOptions = {
    method: 'post',
    path: 'resource-servers',
    data: {
      name: APP_RESOURCE_SERVER_IDENTIFIER,
      identifier: APP_RESOURCE_SERVER_IDENTIFIER,
      scopes: [
        { value: 'create:foo', description: 'create:foo' },
        { value: 'read:foo', description: 'read:foo' },
        { value: 'update:foo', description: 'update:foo' },
        { value: 'delete:foo', description: 'delete:foo' },
      ],
      enforce_policies: true,
      token_dialect: 'access_token_authz',
      skip_consent_for_verifiable_first_party_clients: true,
      allow_offline_access: true,
    },
  };

  try {
    const response = await makeApi2Request(requestOptions);
    return response;
  } catch (error) {
    console.error(error);
    // TODO: Better error, e.g. "make sure you setup the right client grant"
    console.error(`Error while getting client grant: ${error.message}`);
  }
};

const createAppResourceServer = async () => {
  let appResourceServer = await getAppResourceServer();
  if (!appResourceServer) {
    console.log('Demo app resource server does not exist. Creating...');
    appResourceServer = await generateNewAppResourceServer();
  }
  return appResourceServer;
};

module.exports = {
  getClientGrantId,
  setRequiredClientGrant,
  createAppClient,
  createAppResourceServer,
};
