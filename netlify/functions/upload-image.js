const { supabase, verifyAdmin, headers } = require('./_utils');

module.exports = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const { filename, base64 } = JSON.parse(event.body || '{}');
    if (!filename || !base64) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'filename и base64 обязательны' }) };
    }

    // Убираем префикс data:image/...;base64,
    const cleaned = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleaned, 'base64');

    // Уникальный путь
    const ext = (filename.match(/\.\w+$/) || ['.jpg'])[0];
    const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;

    const { error } = await supabase.storage
      .from('dish-images')
      .upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('dish-images')
      .getPublicUrl(path);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ publicUrl: data.publicUrl })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};