const pool = require('./db');

const createUser = async () => {
    try {
        const username = 'admin';
        const password = 'password123';
        const role = 'admin';

        // Check if user exists
        const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (userCheck.rows.length > 0) {
            console.log(`User '${username}' already exists.`);
            console.log(`Username: ${username}`);
            console.log(`Password: ${userCheck.rows[0].password}`); // Assuming plain text for simplicity as per existing code
        } else {
            const newUser = await pool.query(
                "INSERT INTO users (username, password, role) VALUES($1, $2, $3) RETURNING *",
                [username, password, role]
            );
            console.log("User created successfully!");
            console.log(`Username: ${newUser.rows[0].username}`);
            console.log(`Password: ${newUser.rows[0].password}`);
        }
    } catch (err) {
        console.error(err.message);
    } finally {
        // End pool to exit script
        pool.end();
    }
};

createUser();
