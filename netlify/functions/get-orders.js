const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const params = event.queryStringParameters || {};
    const status = params.status || 'pending';

    const { data, error } = await supabase.rpc('get_orders_by_status', { p_status: status });
    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ orders: data || [] })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};