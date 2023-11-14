const dotenv = require("dotenv");

dotenv.config();

const API2_BASE_URL = `https://${process.env.AUTH0_DOMAIN}/api/v2/`;
const API2_AUDIENCE = API2_BASE_URL;
const MFA_AUDIENCE = `https://${process.env.AUTH0_DOMAIN}/mfa`;
const AUTH_REQUESTED_SCOPES =
  "openid email profile create:foo read:foo update:foo delete:foo offline_access";
const USERINFO_ENDPOINT = `https://${process.env.AUTH0_DOMAIN}/userinfo`;
const USERINFO_AUDIENCE = USERINFO_ENDPOINT;
const TOKEN_ENDPOINT = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
const AUTHORIZE_ENDPOINT = `https://${process.env.AUTH0_DOMAIN}/authorize`;
const PAR_ENDPOINT = `https://${process.env.AUTH0_DOMAIN}/oauth/par`;

const REQUIRED_SCOPES_FOR_BACKEND_CLIENT = [
  "create:clients",
  "read:client_grants",
  "update:client_grants",
  "read:clients",
  "delete:clients",
  "read:client_keys",
  "create:connections",
  "read:connections",
  "delete:connections",
  "create:roles",
  "delete:roles",
  "update:roles",
  "read:roles",
  "read:users",
  "delete:users",
  "update:prompts",
  "create:resource_servers",
  "read:resource_servers",
  "delete:resource_servers",
];
const APP_RESOURCE_SERVER_IDENTIFIER = "urn:demo-saas-api";
// CLIENT SETTINGS
// TODO: Make these dynamic e.g. retrieve port
const APP_CALLBACK_URL = "https://myapp.com:4040/callback";
const APP_LOGOUT_URL = "https://myapp.com:4040/logout";
const APP_INITIATE_LOGIN_URL = "https://myapp.com:4040/login";
const CLIENT_NAME_FOR_DEMO_APP = "Demozero";
const APP_LOGO_URI = "https://static.thenounproject.com/png/66350-200.png";

const CLIENT_SECRET_BASIC = "client_secret_basic";
const CLIENT_SECRET_POST = "client_secret_post";
const PRIVATE_KEY_JWT = "jwtca";
const CA_MTLS = "ca_mtls";
const SELF_SIGNED_MTLS = "self_signed_mtls";
const CA_NONE = "none";

// Response Types
const AUTHORIZATION_CODE_RESPONSE = "code";
const TOKEN_RESPONSE = "token";
const ID_TOKEN_RESPONSE = "id_token";
const ID_TOKEN_TOKEN_RESPONSE = "id_token token";
const CODE_ID_TOKEN = "code id_token";
const CODE_ID_TOKEN_TOKEN = "code id_token token";

const PKCE_CODE_CHALLENGE_METHOD_PLAIN = "plain";
const PKCE_CODE_CHALLENGE_METHOD_S256 = "S256";

module.exports = {
  API2_BASE_URL,
  API2_AUDIENCE,
  AUTH_REQUESTED_SCOPES,
  AUTHORIZE_ENDPOINT,
  PAR_ENDPOINT,
  USERINFO_ENDPOINT,
  TOKEN_ENDPOINT,
  REQUIRED_SCOPES_FOR_BACKEND_CLIENT,
  APP_RESOURCE_SERVER_IDENTIFIER,
  APP_CALLBACK_URL,
  APP_LOGOUT_URL,
  APP_INITIATE_LOGIN_URL,
  CLIENT_NAME_FOR_DEMO_APP,
  APP_LOGO_URI,

  AUTHORIZATION_CODE_RESPONSE,
  TOKEN_RESPONSE,
  ID_TOKEN_RESPONSE,
  ID_TOKEN_TOKEN_RESPONSE,

  AUDIENCES: [API2_AUDIENCE, USERINFO_AUDIENCE, MFA_AUDIENCE],

  RESPONSE_TYPES: [
    AUTHORIZATION_CODE_RESPONSE,
    TOKEN_RESPONSE,
    ID_TOKEN_RESPONSE,
    ID_TOKEN_TOKEN_RESPONSE,
    CODE_ID_TOKEN,
    CODE_ID_TOKEN_TOKEN,
  ],

  PKCE_CODE_CHALLENGE_METHODS: [
    PKCE_CODE_CHALLENGE_METHOD_PLAIN,
    PKCE_CODE_CHALLENGE_METHOD_S256,
  ],

  CLIENT_AUTHENTICATION_METHODS: {
    CLIENT_SECRET_BASIC,
    CLIENT_SECRET_POST,
    PRIVATE_KEY_JWT,
    CA_MTLS,
    SELF_SIGNED_MTLS,
    CA_NONE,
  },

  PROMPT_TYPES: [
    "",
    "none",
    "consent",
    "login",
    "select_account"
  ]
};
