const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const dish = JSON.parse(event.body);
    const { data, error } = await supabase.from('dishes').insert(dish).select();
    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data[0]) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};