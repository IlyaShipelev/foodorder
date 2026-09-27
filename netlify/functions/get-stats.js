const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const params = event.queryStringParameters || {};
    const from = params.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const to = params.to || new Date().toISOString().slice(0, 10);

    const [summaryRes, dailyRes, topRes, totalRes] = await Promise.all([
      supabase.rpc('get_stats_range', { from_date: from, to_date: to }),
      supabase.rpc('get_daily_stats', { from_date: from, to_date: to }),
      supabase.rpc('get_top_dishes_range', { from_date: from, to_date: to }),
      supabase.from('stats_summary').select('*').single()
    ]);

    if (summaryRes.error) throw summaryRes.error;
    if (dailyRes.error) throw dailyRes.error;
    if (topRes.error) throw topRes.error;
    if (totalRes.error) throw totalRes.error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary: summaryRes.data?.[0] || { orders_count: 0, revenue: 0, avg_order: 0, unique_users: 0 },
        daily: dailyRes.data || [],
        topDishes: topRes.data || [],
        totals: totalRes.data,
        range: { from, to }
      })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};