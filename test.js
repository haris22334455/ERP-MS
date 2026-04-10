const pool = require('./db');

async function checkConstraint() {
    try {
        await pool.query(`ALTER TABLE users DROP CONSTRAINT users_role_check;`);
        console.log("Dropped constraint");
        await pool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'shopkeeper'));`);
        console.log("Added constraint with shopkeeper");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkConstraint();
