const { supabase, headers } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{}' };

  try {
    const order = JSON.parse(event.body);

    const { data: seq, error: seqErr } = await supabase.rpc('nextval_order');
    if (seqErr) throw seqErr;

    const { data, error } = await supabase.from('orders').insert({
      order_number: seq,
      user_name: order.userName,
      language: order.language,
      total_amount: order.totalAmount,
      items_count: order.itemsCount,
      items: order.items
    }).select();
    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ orderNumber: seq, id: data[0].id })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};