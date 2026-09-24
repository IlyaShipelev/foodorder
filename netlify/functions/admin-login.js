const bcrypt = require('bcryptjs');
const { createToken, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{}' };

  const { username, password } = JSON.parse(event.body || '{}');

  if (username !== process.env.ADMIN_LOGIN) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid' }) };
  }
  const ok = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!ok) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid' }) };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ token: createToken({ role: 'admin', username }) })
  };
};