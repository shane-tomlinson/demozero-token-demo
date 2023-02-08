const express = require("express");
const router = express.Router();
const jwtDecode = require("jwt-decode");

const { getUserInfo, getRefreshToken } = require("../lib/handlers/auth_api");
const { getEnv } = require("../lib/env");
const { APP_LOGOUT_URL } = require("../lib/constants");

const ensureLoggedIn = (req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
  } else {
    return res.redirect("/");
  }

  next();
};

router.get("/", ensureLoggedIn, (req, res, next) => {
  renderUserPage(req, res);
});

router.get("/refresh", ensureLoggedIn, async (req, res, next) => {
  try {
    const refreshTokenResponse = await getRefreshToken(
      req.user.extraParams.refresh_token
    );

    renderUserPage(req, res, {
      idToken: refreshTokenResponse.id_token,
      accessToken: refreshTokenResponse.access_token,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/userinfo", ensureLoggedIn, async (req, res, next) => {
  try {
    const userinfoResponse = await getUserInfo(
      req.user.extraParams.access_token
    );

    renderUserPage(req, res, { userinfoResponse });
  } catch (error) {
    next(error);
  }
});

const renderUserPage = (req, res, data = {}) => {
  const detachedSignature = data.detachedSignature || req.user.extraParams.detached_signature;
  const idToken = data.idToken || req.user.extraParams.id_token;
  const accessToken = data.accessToken || req.user.extraParams.access_token;
  let decodedDetachedSignature = ""
  let decodedIDToken = "";
  let decodedAccessToken = "";

  try {
    // TODO rather than just decoding, verify JWT.
    decodedDetachedSignature = jwtDecode(detachedSignature);
  } catch (error) {
    decodedDetachedSignature = "Unable to decode";
  }

  try {
    decodedIDToken = jwtDecode(idToken);
  } catch (error) {
    decodedIDToken = "Unable to decode";
  }

  try {
    decodedAccessToken = jwtDecode(accessToken);
  } catch (error) {
    decodedAccessToken = "Unable to decode";
  }

  res.render("user", {
    user: req.user,
    decodedDetachedSignature,
    decodedIDToken,
    decodedAccessToken,
    userinfoResponse: data.userinfoResponse,
    title: "Fake SaaS App",
    tokens: {
      detached_signature: detachedSignature,
      refresh_token: req.user.extraParams.refresh_token,
      id_token: idToken,
      access_token: accessToken,
    },
    config: {
      APP_LOGOUT_URL,
      AUTH0_DOMAIN: getEnv().AUTH0_DOMAIN,
      APP_CLIENT_ID: getEnv().APP_CLIENT_ID,
    },
  });
};

router.get("/saml", ensureLoggedIn, (req, res, next) => {
  renderUserPageWithSAML(req, res);
});

const renderUserPageWithSAML = (req, res) => {
  const samlProfile = req.user.profile;

  res.render("samluser", {
    user: req.user,
    samlProfile,
    title: "Fake SAML SaaS App",
    config: {
      APP_LOGOUT_URL,
      AUTH0_DOMAIN: getEnv().AUTH0_DOMAIN,
      APP_CLIENT_ID: getEnv().SAML_APP_CLIENT_ID,
    },
  });
};

module.exports = router;
