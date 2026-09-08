// netlify/functions/bold-signature.js
//
// Calcula el "hash de integridad" que exige Bold para pagos con monto fijo.
// La llave secreta NUNCA sale de este archivo (corre en el servidor de Netlify,
// no en el navegador del cliente) y se lee desde una variable de entorno privada.
//
// Configúrala en: Netlify → Site configuration → Environment variables
//   Nombre:  BOLD_SECRET_KEY
//   Valor:   (la llave secreta de Bold, la que empieza distinto a la de identidad)

const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secretKey = process.env.BOLD_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'BOLD_SECRET_KEY no está configurada en Netlify.' }),
    };
  }

  try {
    const { orderId, amount, currency } = JSON.parse(event.body);

    if (!orderId || !amount || !currency) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Faltan datos: orderId, amount o currency.' }),
      };
    }

    // Bold exige esta concatenación exacta, en este orden:
    // {Identificador}{Monto}{Divisa}{LlaveSecreta}
    const cadena = `${orderId}${amount}${currency}${secretKey}`;
    const signature = crypto.createHash('sha256').update(cadena).digest('hex');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Solicitud inválida.' }),
    };
  }
};
