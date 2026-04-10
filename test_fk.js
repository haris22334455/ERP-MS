const pool = require('./db');
async function run() {
    try {
        const res = await pool.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'order_items_product_id_fkey'");
        console.log("Constraint:", res.rows[0]);
    } catch (e) {
        console.error(e.message);
    } finally {
        pool.end();
    }
}
run();
