const { supabase, verifyAdmin, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!verifyAdmin(event)) return { statusCode: 401, headers, body: '{}' };

  try {
    const params = event.queryStringParameters || {};
    const from = params.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const to = params.to || new Date().toISOString().slice(0, 10);
    const type = params.type || 'orders';

    let rows = [];

    if (type === 'orders') {
      const { data, error } = await supabase.rpc('get_orders_range', { from_date: from, to_date: to });
      if (error) throw error;

      rows.push([
        'Order Number', 'Order Date', 'User Name', 'Language',
        'Total Amount', 'Items Count', 'Status',
        'Dish ID', 'Dish Name', 'Price', 'Weight', 'Qty', 'Subtotal',
        'Category', 'Source Type', 'Week', 'Week Label',
        'Day', 'Day Label', 'Delivery Date'
      ]);

      data.forEach(o => {
        const items = Array.isArray(o.items) ? o.items : [];
        items.forEach(it => {
          rows.push([
            o.order_number,
            new Date(o.order_date).toLocaleString('es-MX'),
            o.user_name,
            o.language,
            Number(o.total_amount),
            o.items_count,
            o.status || 'pending',
            it.dishId || '',
            it.name || '',
            Number(it.price) || 0,
            it.weight || 0,
            it.qty || 0,
            Number(it.subtotal) || 0,
            it.category || '',
            it.sourceType || '',
            it.week || '',
            it.weekLabel || '',
            it.day || '',
            it.dayLabel || '',
            it.date || ''
          ]);
        });
      });
    } else if (type === 'dishes') {
      const { data, error } = await supabase.rpc('get_top_dishes_range', { from_date: from, to_date: to });
      if (error) throw error;
      rows.push(['Dish Name', 'Total Qty', 'Total Revenue']);
      data.forEach(d => rows.push([d.dish_name, d.total_qty, Number(d.total_revenue)]));
    } else if (type === 'daily') {
      const { data, error } = await supabase.rpc('get_daily_stats', { from_date: from, to_date: to });
      if (error) throw error;
      rows.push(['Date', 'Orders Count', 'Revenue']);
      data.forEach(d => rows.push([d.day, d.orders_count, Number(d.revenue)]));
    }

    const csv = rows.map(r =>
      r.map(v => {
        const s = String(v ?? '');
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      }).join(',')
    ).join('\n');

    const csvWithBom = '\uFEFF' + csv.replace(/\n/g, '\r\n');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="stats_${type}_${from}_${to}.csv"`
      },
      body: csvWithBom
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};