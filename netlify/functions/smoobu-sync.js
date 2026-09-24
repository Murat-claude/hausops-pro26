const crypto = require('crypto');

// HMAC-Signatur für Smoobu API v2 generieren
function generateHmacSignature(method, path, secret, timestamp, body = '') {
  const message = `${method}${path}${timestamp}${body}`;
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64');
}

// Smoobu API v2 mit HMAC aufrufen
async function callSmoobuAPI(method, endpoint, secret, body = null) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateHmacSignature(method, endpoint, secret, timestamp, body ? JSON.stringify(body) : '');

  const headers = {
    'X-API-Key': process.env.SMOOBU_API_KEY,
    'X-Signature': signature,
    'X-Timestamp': timestamp,
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `https://api.smoobu.com${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Smoobu API ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Netlify Function Handler
exports.handler = async (event) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // OPTIONS Request für CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: 'OK',
    };
  }

  try {
    // API Key & Secret von Netlify Env Vars
    const apiKey = process.env.SMOOBU_API_KEY;
    const apiSecret = process.env.SMOOBU_SECRET;

    if (!apiKey || !apiSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing SMOOBU credentials in environment' }),
      };
    }

    // GET /bookings - alle Buchungen seit letztem Sync abrufen
    if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/smoobu-sync') {
      const queryParams = event.queryStringParameters || {};
      const from = queryParams.from || '2026-01-01';
      const to = queryParams.to || new Date().toISOString().split('T')[0];

      const bookings = await callSmoobuAPI('GET', `/api/v3/bookings?from=${from}&to=${to}&includeGuests=true`, apiSecret);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: bookings.data?.length || 0,
          bookings: bookings.data || [],
        }),
      };
    }

    // POST /bookings - neue Buchung (optional für zukünftige Nutzung)
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const result = await callSmoobuAPI('POST', '/api/v3/bookings', apiSecret, body);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          booking: result,
        }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Smoobu Sync Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
