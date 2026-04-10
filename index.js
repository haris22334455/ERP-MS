const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken'); // Naya package install karein: npm install jsonwebtoken
const secretKey = "MaTraders_Secret_Key_2026"; // Ye aapki security chabi hai

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body read karne ke liye lazmi hai

// --- SECURITY GATEKEEPER ---
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(403).json("Access Denied: No Token Provided");

  try {
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json("Invalid Token");
  }
};

// 1. Home Route
app.get('/', (req, res) => {
  res.send('Colgate Enterprise Server is Running!');
});

// --- PRODUCT MANAGEMENT ROUTES ---

// 2. GET: Saare products ki list
app.get("/products", async (req, res) => {
  try {
    const allProducts = await pool.query('SELECT * FROM "MA Traders" ORDER BY id ASC');
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET: Search feature
app.get("/search", async (req, res) => {
  try {
    const { name } = req.query;
    const searchResult = await pool.query(
      'SELECT * FROM "MA Traders" WHERE item_name ILIKE $1 OR brand_name ILIKE $1',
      [`%${name}%`]
    );
    res.json(searchResult.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// 4. POST: Naya Product add karna
app.post("/add-product", async (req, res) => {
  try {
    const { brand, item_name, price, stock } = req.body;
    const newProduct = await pool.query(
      'INSERT INTO "MA Traders" (brand_name, item_name, price, stock) VALUES($1, $2, $3, $4) RETURNING *',
      [brand, item_name, price, stock]
    );
    res.json(newProduct.rows[0]);
  } catch (err) {
    console.error("SQL Error:", err.message);
    res.status(500).send("Database Error: " + err.message);
  }
});

// 5. PUT: Product update karna
app.put("/update-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock } = req.body;
    const updateProduct = await pool.query(
      'UPDATE "MA Traders" SET price = $1, stock = $2 WHERE id = $3 RETURNING *',
      [price, stock, id]
    );
    res.json("Product update ho gaya!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 6. DELETE: Product khatam karna
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM "MA Traders" WHERE id = $1', [id]);
    res.json("Product delete ho gaya!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- SHOP & LEDGER MANAGEMENT ROUTES ---

// 7. POST: Nayi dukan register karna
app.post("/add-shop", async (req, res) => {
  try {
    const { shop_name, shop_address } = req.body;
    const newShop = await pool.query(
      "INSERT INTO shops (shop_name, shop_address) VALUES($1, $2) RETURNING *",
      [shop_name, shop_address]
    );
    res.json(newShop.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 7.1 GET: Saare shops ki list (Dropdown/List ke liye)
app.get("/shops", async (req, res) => {
  try {
    const allShops = await pool.query("SELECT * FROM shops ORDER BY shop_id ASC");
    res.json(allShops.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 7.2 DELETE: Shop delete karna
app.delete("/delete-shop/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM shops WHERE shop_id = $1', [id]);
    res.json("Shop deleted successfully!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 8. POST: Ledger entry (Maal dena/Paise lena)
app.post("/add-transaction", async (req, res) => {
  try {
    const { shop_id, description, debit, credit } = req.body;
    const lastEntry = await pool.query(
      "SELECT balance FROM ledger WHERE shop_id = $1 ORDER BY date DESC LIMIT 1",
      [shop_id]
    );

    let oldBalance = lastEntry.rows.length > 0 ? parseFloat(lastEntry.rows[0].balance) : 0;
    let newBalance = oldBalance + parseFloat(debit) - parseFloat(credit);

    const newTransaction = await pool.query(
      "INSERT INTO ledger (shop_id, description, debit, credit, balance) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [shop_id, description, debit, credit, newBalance]
    );

    await pool.query("UPDATE shops SET total_debt = $1 WHERE shop_id = $2", [newBalance, shop_id]);
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 9. GET: Kisi dukan ka mukammal Udhaar/Hisab (Ledger History)
app.get("/shop-ledger/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const history = await pool.query(
      "SELECT * FROM ledger WHERE shop_id = $1 ORDER BY date ASC",
      [id]
    );
    res.json(history.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 10. GET: Market Summary (Kul kitna udhaar market mein hai)
app.get("/market-summary", async (req, res) => {
  try {
    const summary = await pool.query(
      "SELECT SUM(total_debt) as total_market_receivable, COUNT(shop_id) as total_shops FROM shops"
    );
    res.json(summary.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 11. GET: Saare users ki list (Admin only)
app.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT user_id as id, username, role, shop_id FROM users ORDER BY user_id ASC");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 12. POST: User Registration (Admin/Staff/Shopkeeper)
app.post("/register", async (req, res) => {
  try {
    const { username, password, role, shop_id } = req.body;

    // Check if user already exists
    const userExist = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userExist.rows.length > 0) {
      return res.status(401).json({ message: "Username already taken!" });
    }

    // Insert new user (Handle optional shop_id)
    const newUser = await pool.query(
      "INSERT INTO users (username, password, role, shop_id) VALUES($1, $2, $3, $4) RETURNING *",
      [username, password, role, shop_id || null]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: " + err.message);
  }
});

// 12. UPDATED POST: Login Logic with Token
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Username");
    }

    if (password !== user.rows[0].password) {
      return res.status(401).json("Invalid Password");
    }

    // Token generate karna (24 hours ke liye)
    const token = jwt.sign(
      { id: user.rows[0].user_id, role: user.rows[0].role },
      secretKey,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login Successful!",
      token: token, // Ye token frontend ke liye zaroori hai
      user: {
        id: user.rows[0].user_id,
        username: user.rows[0].username,
        role: user.rows[0].role,
        shop_id: user.rows[0].shop_id
      }
    });
  } catch (err) {
    console.error(err.message);
  }
});

// 13. UPDATED POST: Multiple items ke saath order book karna
app.post("/book-order", async (req, res) => {
  const client = await pool.connect(); // Transaction ke liye client use karein
  try {
    const { shop_id, user_id, items, total_amount } = req.body;

    await client.query('BEGIN'); // Database transaction shuru

    // A. Orders table mein main entry (Staff ID ke saath)
    const newOrder = await client.query(
      "INSERT INTO orders (shop_id, user_id, total_amount, status) VALUES($1, $2, $3, 'pending') RETURNING *",
      [shop_id, user_id, total_amount]
    );

    const orderId = newOrder.rows[0].order_id;

    // B. Order Items table mein har item ki entry
    const itemQueries = items.map(item => {
      return client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price_at_sale) VALUES($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    });

    await Promise.all(itemQueries);

    // C. Automatically update stock
    const stockQueries = items.map(item => {
      return client.query(
        'UPDATE "MA Traders" SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    });

    await Promise.all(stockQueries);

    await client.query('COMMIT'); // Sab sahi raha toh save kar dein

    res.json({ message: "Order booked with items!", order: newOrder.rows[0] });

  } catch (err) {
    await client.query('ROLLBACK'); // Error aaye toh saara kaam cancel
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 14. PUT: Order Deliver karna aur Ledger Update karna (Admin Feature)
app.put("/deliver-order/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;

    // 1. Order ka data nikalna
    const orderData = await pool.query("SELECT * FROM orders WHERE order_id = $1", [order_id]);
    const { shop_id, total_amount } = orderData.rows[0];

    // 2. Status 'delivered' karna
    await pool.query("UPDATE orders SET status = 'delivered' WHERE order_id = $1", [order_id]);

    // 3. Automatically Ledger mein "Udhaar" add karna
    // Hum wahi logic use karenge jo transaction mein karte hain
    const lastEntry = await pool.query("SELECT balance FROM ledger WHERE shop_id = $1 ORDER BY date DESC LIMIT 1", [shop_id]);
    let oldBalance = lastEntry.rows.length > 0 ? parseFloat(lastEntry.rows[0].balance) : 0;
    let newBalance = oldBalance + parseFloat(total_amount);

    await pool.query(
      "INSERT INTO ledger (shop_id, description, debit, credit, balance) VALUES($1, $2, $3, $4, $5)",
      [shop_id, `Order Delivered (ID: ${order_id})`, total_amount, 0, newBalance]
    );

    await pool.query("UPDATE shops SET total_debt = $1 WHERE shop_id = $2", [newBalance, shop_id]);

    res.json("Order delivered and Ledger updated!");
  } catch (err) {
    console.error(err.message);
  }
});
// 15. GET: Saare pending orders dekhna
app.get("/pending-orders", async (req, res) => {
  try {
    const orders = await pool.query("SELECT * FROM orders WHERE status = 'pending'");
    res.json(orders.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// 16. GET: Admin Report (Kisne, Kya aur Kahan sale kiya)
app.get("/admin/staff-sales", async (req, res) => {
  try {
    const report = await pool.query(`
      SELECT 
        u.username AS staff_member,
        s.shop_name,
        p.item_name AS product,
        oi.quantity,
        o.total_amount,
        o.status
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN "MA Traders" p ON oi.product_id = p.id
    `);
    res.json(report.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 17. GET: Daily Balance Sheet
app.get("/admin/daily-report", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Aaj ki date
    const report = await pool.query(`
      SELECT 
        SUM(debit) as total_sales_on_credit, 
        SUM(credit) as total_cash_received,
        (SUM(debit) - SUM(credit)) as net_balance
      FROM ledger 
      WHERE date::date = $1
    `, [today]);

    res.json({
      date: today,
      summary: report.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 18. GET: Monthly Balance Sheet (Improved with Null Handling)
app.get("/admin/monthly-report", verifyToken, async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validation
    if (!month || !year) {
      return res.status(400).json({ error: "Please provide month and year (e.g., ?month=2&year=2026)" });
    }

    const report = await pool.query(`
      SELECT 
        COUNT(ledger_id) as total_transactions,
        COALESCE(SUM(debit), 0) as monthly_sales,
        COALESCE(SUM(credit), 0) as monthly_recovery,
        (COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)) as monthly_balance
      FROM ledger 
      WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2
    `, [month, year]);

    res.json(report.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// 19. GET: Detailed Product Sales History
app.get("/admin/detailed-sales", async (req, res) => {
  try {
    const history = await pool.query(`
      SELECT 
        u.username AS staff_name,
        s.shop_name,
        p.item_name AS product,
        oi.quantity,
        o.total_amount AS bill_amount,
        o.order_date,
        o.status
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      JOIN shops s ON o.shop_id = s.shop_id
      JOIN "MA Traders" p ON oi.product_id = p.id
      ORDER BY o.order_date DESC
    `);
    res.json(history.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 19b. GET: Detailed Ledger Report for PDF (Admin)
app.get("/admin/ledger-report", async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly

    let dateFilter = "";
    if (period === 'daily') {
      dateFilter = "date::date = CURRENT_DATE";
    } else if (period === 'weekly') {
      dateFilter = "date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'monthly') {
      dateFilter = "date >= CURRENT_DATE - INTERVAL '1 month'";
    } else {
      dateFilter = "1=1"; // all time fallback
    }

    const reportQuery = `
      SELECT 
        TO_CHAR(l.date, 'DD-MM-YYYY') as formatted_date,
        s.shop_name,
        l.description,
        l.debit as cash_in,
        l.credit as cash_out,
        l.balance
      FROM ledger l
      LEFT JOIN shops s ON l.shop_id = s.shop_id
      WHERE ${dateFilter}
      ORDER BY l.date DESC
    `;

    const reportData = await pool.query(reportQuery);
    res.json(reportData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 20. GET: Shop Recovery Status
app.get("/admin/recovery-status", async (req, res) => {
  try {
    const status = await pool.query(`
      SELECT 
        shop_name, 
        shop_address, 
        total_debt AS amount_pending 
      FROM shops 
      WHERE total_debt > 0 
      ORDER BY total_debt DESC
    `);
    res.json(status.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// 21. POST: Naya kharcha (Expense) add karna
app.post("/add-expense", async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    const newExpense = await pool.query(
      "INSERT INTO expenses (description, amount, category) VALUES($1, $2, $3) RETURNING *",
      [description, amount, category]
    );
    res.json({ message: "Expense added!", data: newExpense.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 22. GET: Profit & Loss Summary (Owner Dashboard ke liye)
app.get("/admin/net-profit", async (req, res) => {
  try {
    const { month, year } = req.query; // Maslan: ?month=2&year=2026

    // A. Total Sales (Ledger se Debit uthayenge)
    const sales = await pool.query(
      "SELECT COALESCE(SUM(debit), 0) as total_sales FROM ledger WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2",
      [month, year]
    );

    // B. Total Expenses (Expenses table se sum)
    const exp = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2",
      [month, year]
    );

    const totalSales = parseFloat(sales.rows[0].total_sales);
    const totalExpenses = parseFloat(exp.rows[0].total_expenses);
    const profit = totalSales - totalExpenses;

    res.json({
      month,
      year,
      gross_sales: totalSales,
      total_expenses: totalExpenses,
      net_profit: profit,
      status: profit >= 0 ? "Profit" : "Loss"
    });
  } catch (err) {
    console.error(err.message);
  }
});

// Server Start
app.listen(5000, () => {
  console.log("Server 5000 port par chal raha hai...");
});