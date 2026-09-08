// netlify/functions/auth.js
//
// Primer paso del login del panel (/admin) contra GitHub.
// Redirige a la pantalla de autorización de GitHub. No maneja ningún
// dato sensible directamente — solo arma la URL de inicio del login.
//
// Requiere la variable de entorno (Netlify → Environment variables):
//   OAUTH_CLIENT_ID  → el "Client ID" de la OAuth App de GitHub

exports.handler = async (event) => {
  const clientId = process.env.OAUTH_CLIENT_ID;

  if (!clientId) {
    return {
      statusCode: 500,
      body: 'OAUTH_CLIENT_ID no está configurada en Netlify.',
    };
  }

  const host = event.headers.host;
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/.netlify/functions/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo',
  });

  return {
    statusCode: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
    },
  };
};
