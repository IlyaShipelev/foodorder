const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function verifyAdmin(event) {
  const auth = event.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return false;
  try {
    const [h, b, sig] = token.split('.');
    const expected = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(`${h}.${b}`)
      .digest('base64url');
    if (sig !== expected) return false;
    const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
    return payload.role === 'admin' && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

module.exports = { supabase, verifyAdmin, createToken, headers };