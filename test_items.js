const pool = require('./db');
async function run() {
    try {
        const res = await pool.query('SELECT id, item_name, stock FROM "MA Traders" LIMIT 1');
        console.log(res.rows[0]);
    } catch (e) {
        console.error(e.message);
    } finally {
        pool.end();
    }
}
run();
