const pool = require('./db');
async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const newOrder = await client.query('INSERT INTO orders (shop_id, user_id, total_amount, status) VALUES($1, $2, $3, \'pending\') RETURNING *', [2, 1, 300]);
        const orderId = newOrder.rows[0].order_id;
        await client.query("INSERT INTO order_items (order_id, product_id, quantity, price_at_sale) VALUES($1, $2, $3, $4)", [orderId, 3, 5, 20]);
        await client.query('UPDATE "MA Traders" SET stock = stock - $1 WHERE id = $2', [5, 3]);
        await client.query('COMMIT');
        console.log('Success, stock updated!');
    } catch (e) {
        console.error('Error:', e.message);
        await client.query('ROLLBACK');
    } finally {
        client.release();
        pool.end();
    }
}
run();
