const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const { id, status } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };

    const newStatus = status || 'completed';

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, status: newStatus }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};