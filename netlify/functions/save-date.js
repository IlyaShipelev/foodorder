const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const { week, day, date_value } = JSON.parse(event.body);
    const { data, error } = await supabase
      .from('week_dates')
      .upsert({ week, day, date_value }, { onConflict: 'week,day' })
      .select();
    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data[0]) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};