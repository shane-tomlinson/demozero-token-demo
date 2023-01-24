"use strict";

const OAUTH_PARAM_NAMES = [
  "error",
  "error_description",
  "code",
  "state",
  "access_token",
  "id_token",
];

function hasImplicitOAuthParams(hashParams) {
  return OAUTH_PARAM_NAMES.find((paramName) => hashParams.has(paramName));
}

document.addEventListener("DOMContentLoaded", async () => {
  const url = new URL(document.location);
  if (url.pathname === "/callback") {
    const hashParams = new URLSearchParams(
      document.location.hash.replace("#", "")
    );

    if (hasImplicitOAuthParams(hashParams)) {
      // This path is followed when an implicit/hybrid flow is used. Take the
      // parameters from the hash, put them into a form, and submit

      OAUTH_PARAM_NAMES.forEach((paramName) => {
        if (hashParams.has(paramName)) {
          document
            .querySelector(`[name=${paramName}]`)
            .setAttribute("value", hashParams.get(paramName));
        }
      });

      document.callback_form.submit();
    } else {
      document.location = "/";
    }
  }
});
