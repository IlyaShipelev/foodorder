const { supabase, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const [dishesRes, datesRes] = await Promise.all([
      supabase.from('dishes').select('*'),
      supabase.from('week_dates').select('*')
    ]);
    if (dishesRes.error) throw dishesRes.error;
    if (datesRes.error) throw datesRes.error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ dishes: dishesRes.data, weekDates: datesRes.data })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};