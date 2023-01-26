const dotenv = require('dotenv');
const { APP_RESOURCE_SERVER_IDENTIFIER, CLIENT_NAME_FOR_DEMO_APP } = require('../lib/constants');
const { makeApi2Request } = require('../lib/api2');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();

const resetTenant = async () => {
  console.log('This script will remove artifacts from the tenant used for this demo app.');
  console.log('The next time the app boots, these artifacts will be re-created.');
  console.log('>>> DELETING CLIENT');
  await deleteAppClient();
  console.log('>>> DELETING RESOURCE SERVER');
  await deleteAppResourceServer();
};

const deleteAppClient = async () => {
  const getClientsRequest = {
    path: 'clients?page=0&per_page=100',
  };

  const clients = await makeApi2Request(getClientsRequest);
  const appClient = clients.filter((client) => client.name === CLIENT_NAME_FOR_DEMO_APP);
  if (appClient.length < 1) {
    return;
  }

  const request = {
    method: 'delete',
    path: `clients/${appClient[0].client_id}`,
  };
  await makeApi2Request(request);
};

const deleteAppResourceServer = async () => {
  const request = {
    method: 'delete',
    path: `resource-servers/${APP_RESOURCE_SERVER_IDENTIFIER}`,
  };
  await makeApi2Request(request);
};

resetTenant();
