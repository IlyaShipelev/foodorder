const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  const { id } = event.queryStringParameters || {};
  if (!id) return { statusCode: 400, headers, body: '{}' };

  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};