const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const dish = JSON.parse(event.body);

    if (dish.image_url && dish.image_url.startsWith('data:')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'image_url must be a URL, not base64. Use upload-image.' }) };
    }
    if (dish.image_url && dish.image_url.length > 500) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'image_url too long — likely base64' }) };
    }

    const { data, error } = await supabase.from('dishes').insert(dish).select();
    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data[0]) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};