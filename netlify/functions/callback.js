// netlify/functions/callback.js
//
// Segundo paso del login del panel (/admin). GitHub redirige aquí con un
// "code" temporal; esta función lo cambia por un token de acceso real
// (usando la llave secreta de la OAuth App, que NUNCA se envía al navegador)
// y se lo entrega al panel de administración mediante postMessage.
//
// Requiere las variables de entorno (Netlify → Environment variables):
//   OAUTH_CLIENT_ID      → el "Client ID" de la OAuth App de GitHub
//   OAUTH_CLIENT_SECRET  → el "Client Secret" de la OAuth App de GitHub

const https = require('https');

function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code: code,
    });

    const options = {
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  const code = event.queryStringParameters && event.queryStringParameters.code;

  if (!code) {
    return { statusCode: 400, body: 'Falta el parámetro "code" en la respuesta de GitHub.' };
  }

  try {
    const tokenData = await exchangeCodeForToken(code);

    if (!tokenData.access_token) {
      return {
        statusCode: 400,
        body: 'GitHub no devolvió un token válido: ' + JSON.stringify(tokenData),
      };
    }

    const token = tokenData.access_token;

    // Le entrega el token al panel (/admin) que abrió esta ventana emergente,
    // siguiendo el protocolo que espera Decap CMS.
    const html = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(token)}, provider: 'github' }),
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html,
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error autenticando con GitHub: ' + err.message };
  }
};
