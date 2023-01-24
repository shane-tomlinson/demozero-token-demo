"use strict";

function hasImplicitOAuthParams(hashParams) {
  return (
    hashParams.has("code") ||
    hashParams.has("id_token") ||
    hashParams.hash("access_token") ||
    hashParams.has("error")
  );
}

(async () => {
  const url = new URL(document.location);
  const hashParams = new URLSearchParams(
    document.location.hash.replace("#", "")
  );


  if (url.pathname === "/" && hasImplicitOAuthParams(hashParams)) {
    // This path is followed when an implicit/hybrid flow is used. We redirect back
    // to callback pushing the hash parameters onto the query parameters and
    // retry.

    // TODO - if an id_token is returned, check the detached signature.

    // TODO - instead of doing everything on the URL (which is easy), POST
    // to the backend.

    url.pathname = "/callback";

    // do not propagate id_token and access_token, we don't want them saved
    // in browser history.
    hashParams.delete('id_token');
    hashParams.delete('access_token');
    url.search = hashParams.toString();
    url.hash = '';

    document.location = url.toString();
  }
})();
