# 📘 ERP-MS — Complete Project Context File

> **PURPOSE:** This is a comprehensive reference file. Read ONLY this file to fully understand the entire
> project before making any changes. No need to read every individual file.
>
> **Last Updated:** July 10, 2026

---

## 1. PROJECT OVERVIEW

**Name:** ERP-MS (Enterprise Resource Planning – Management System)
**Domain:** Wholesale FMCG (Fast-Moving Consumer Goods) Distribution
**Purpose:** Digitize manual business operations — order booking, inventory tracking, financial ledger (udhaar/credit), and expense management.
**Architecture:** Full-Stack Monolith (React SPA + Spring Boot REST API + PostgreSQL)

---

## 2. TECHNOLOGY STACK

| Layer          | Technology                                                   |
|----------------|--------------------------------------------------------------|
| **Frontend**   | React.js 19, React Router DOM 7, Axios, Recharts, CSS3      |
| **Backend**    | Java 17, Spring Boot 3.3.7, Spring Data JPA, Hibernate      |
| **Database**   | PostgreSQL (schema: `public`)                                |
| **Auth**       | JWT (jjwt 0.12.6) + BCrypt (spring-security-crypto)         |
| **Build**      | Maven (backend), npm / react-scripts (frontend)              |
| **PDF Export** | jsPDF + jsPDF-AutoTable (client-side)                        |
| **Notifications** | React Hot Toast + SweetAlert2                            |
| **Icons**      | React Icons (Font Awesome set)                               |
| **Charts**     | Recharts 3.7                                                 |
| **Deployment** | Railway (backend), Vercel (frontend)                         |
| **Env Mgmt**   | spring-dotenv 4.0.0 (loads `.env` into Spring)              |

---

## 3. PORTS & URLS

| Service   | Local Dev                                    | Production                              |
|-----------|----------------------------------------------|-----------------------------------------|
| Frontend  | `http://localhost:3000`                      | Vercel (auto)                           |
| Backend   | `http://localhost:5000`                      | Railway sets PORT env var               |
| Database  | `jdbc:postgresql://localhost:5432/postgres`  | Railway sets DATABASE_URL               |
| Proxy     | `package.json` → `"proxy": "http://localhost:5000"` | `REACT_APP_API_URL` env var     |

---

## 4. COMPLETE FILE STRUCTURE

```
ERP-managment system/
├── .gitignore
├── README.md
├── Project_Proposal.md
├── start_project.bat              # Starts both backend + frontend
├── db_schema.txt                  # Orders/OrderItems column reference
├── ma_schema.txt                  # Products ("ERP-MS" table) column reference
│
├── erp-backend/
│   ├── .env                       # DB_PASSWORD, JWT_SECRET, ALLOWED_ORIGIN
│   ├── .gitignore
│   ├── pom.xml                    # Maven dependencies
│   ├── Dockerfile                 # Docker build config
│   ├── nixpacks.toml              # Railway nixpacks config
│   ├── railway.json               # Railway deployment config
│   ├── mvnw.cmd                   # Maven wrapper (Windows)
│   └── src/main/
│       ├── resources/
│       │   └── application.properties   # Spring Boot config (DB, JWT, SSL docs)
│       └── java/com/erp/
│           ├── ErpApplication.java      # @SpringBootApplication main class
│           ├── DBCheck.java             # Empty/stub file
│           │
│           ├── config/
│           │   └── WebConfig.java       # CORS config + JwtFilter registration
│           │
│           ├── security/
│           │   ├── JwtUtil.java         # JWT generate/validate/extract (SHA-256 key derivation)
│           │   ├── JwtFilter.java       # OncePerRequestFilter — validates JWT on every request
│           │   ├── TokenBlacklist.java  # In-memory ConcurrentHashMap blacklist for logout
│           │   └── LoginRateLimiter.java # 5 attempts / 15 min window / 15 min lockout
│           │
│           ├── entity/
│           │   ├── Product.java         # Table: "ERP-MS" (quoted!)
│           │   ├── Shop.java            # Table: shops
│           │   ├── User.java            # Table: users
│           │   ├── Order.java           # Table: orders
│           │   ├── OrderItem.java       # Table: order_items
│           │   ├── Ledger.java          # Table: ledger
│           │   └── Expense.java         # Table: expenses
│           │
│           ├── dto/
│           │   ├── BookOrderRequest.java    # { shop_id, user_id, total_amount, items[] }
│           │   └── ReturnOrderRequest.java  # { items[]: { productId, quantity } }
│           │
│           ├── repository/
│           │   ├── ProductRepository.java   # Pagination + search + stock ops
│           │   ├── ShopRepository.java      # Market summary + pending dues
│           │   ├── UserRepository.java      # findByUsername + nullifyShopId
│           │   ├── OrderRepository.java     # findByStatus + cascading deletes
│           │   ├── OrderItemRepository.java # findByOrderId/ProductId + cascading deletes
│           │   ├── LedgerRepository.java    # Daily/Monthly/Weekly reports + balance queries
│           │   └── ExpenseRepository.java   # Monthly expense sum
│           │
│           └── controller/
│               ├── HomeController.java          # GET / → health check
│               ├── UserController.java          # /login, /register, /logout, /init-admin, /users
│               ├── ProductController.java       # /products (paginated), /add-product, /update-product, /delete-product
│               ├── ShopController.java          # /shops, /add-shop, /delete-shop, /market-summary
│               ├── OrderController.java         # /book-order, /deliver-order, /cancel-order, /return-order, /pending-orders, /orders, /order-items
│               ├── LedgerController.java        # /add-transaction, /shop-ledger/{id}
│               ├── ExpenseController.java       # /add-expense, /expenses
│               ├── ReportController.java        # /admin/staff-sales, /daily-report, /monthly-report, /detailed-sales, /ledger-report, /recovery-status, /net-profit
│               └── GlobalExceptionHandler.java  # @ControllerAdvice — catches all unhandled exceptions → JSON
│
├── erp-frontend/
│   ├── .gitignore
│   ├── package.json               # React 19, Axios, Recharts, SweetAlert2, jsPDF, etc.
│   ├── vercel.json                # Vercel SPA rewrites config
│   ├── replace_alerts.py          # Utility script (replace alerts)
│   ├── replace_toasts.py          # Utility script (replace toasts)
│   ├── public/                    # Static assets (index.html, favicon, etc.)
│   └── src/
│       ├── index.js               # React DOM render entry point
│       ├── index.css              # Root CSS
│       ├── App.js                 # Router config + ProtectedRoute + JWT role decode
│       ├── App.css                # Global styles (15KB — glassmorphism, sidebar, grid, etc.)
│       ├── config.js              # API_BASE_URL (REACT_APP_API_URL || localhost:5000)
│       ├── Login.js               # OLD Login (src/Login.js) — NOT USED (pages/Login.js is active)
│       │
│       ├── components/
│       │   ├── Layout.js          # Sidebar + Header + <Outlet/> layout wrapper
│       │   ├── Sidebar.js         # Role-based nav links, collapse toggle, logout
│       │   ├── Header.js          # Top bar — notifications, profile dropdown, mobile toggle
│       │   └── DataGrid.js        # Reusable table component (columns, data, actions)
│       │
│       └── pages/
│           ├── Login.js           # Login page (used by routes)
│           ├── Dashboard.js       # Admin bento-box dashboard (charts, stats, quick actions)
│           ├── DashboardStyles.css # Dashboard-specific CSS
│           ├── Products.js        # Product CRUD + pagination + search + low-stock
│           ├── Products.css       # Product page CSS
│           ├── Shops.js           # Shop management (add, delete, view ledger)
│           ├── ShopLedger.js      # Individual shop ledger view + add transaction
│           ├── OrderBooking.js    # POS-style cart system (select shop, add products, book)
│           ├── Orders.js          # View all orders + deliver/cancel/return actions
│           ├── Reports.js         # Staff sales, daily/monthly report, recovery, P&L
│           ├── Users.js           # User management (register, delete)
│           ├── Expenses.js        # Expense tracking (add, list)
│           └── ModernUI.css       # Shared modern UI styles (glassmorphism, gradients, etc.)
```

---

## 5. DATABASE SCHEMA (PostgreSQL)

### 5.1 `"ERP-MS"` Table (Products) — ⚠️ TABLE NAME IS QUOTED!
```
@Table(name = "\"ERP-MS\"")

| Column             | Type         | Notes                              |
|--------------------|--------------|-------------------------------------|
| id                 | SERIAL PK    | Auto-increment                      |
| item_name          | VARCHAR      |                                     |
| brand_name         | VARCHAR      |                                     |
| price              | NUMERIC      | BigDecimal                          |
| stock              | INTEGER      |                                     |
| company_name       | VARCHAR      |                                     |
| minimum_threshold  | INT (def 10) | For low-stock alerts                |
```

### 5.2 `shops` Table
```
| Column       | Type       | Notes               |
|--------------|------------|----------------------|
| shop_id      | SERIAL PK  |                      |
| shop_name    | VARCHAR    |                      |
| shop_address | VARCHAR    |                      |
| total_debt   | NUMERIC    | Running balance      |
```

### 5.3 `users` Table
```
| Column   | Type            | Notes                                     |
|----------|-----------------|-------------------------------------------|
| user_id  | SERIAL PK       |                                           |
| username | VARCHAR (UNIQUE)|                                           |
| password | VARCHAR         | BCrypt hashed (cost 12)                   |
| role     | VARCHAR         | "admin" / "staff" / "shopkeeper"          |
| shop_id  | VARCHAR (FK)    | String type! (links shopkeeper → shop)    |
```
> ⚠️ **NOTE:** `shop_id` in `users` table is **String**, not Integer.

### 5.4 `orders` Table
```
| Column       | Type         | Notes                                     |
|--------------|--------------|-------------------------------------------|
| order_id     | SERIAL PK    |                                           |
| shop_id      | INTEGER FK   |                                           |
| user_id      | INTEGER FK   | Can be NULL (if user deleted)             |
| total_amount | NUMERIC      |                                           |
| status       | VARCHAR      | "pending" / "delivered" / "cancelled" / "returned" / "partially returned" |
| order_date   | TIMESTAMP    | DB-generated (insertable=false, updatable=false) |
```

### 5.5 `order_items` Table
```
| Column            | Type       | Notes                                  |
|-------------------|------------|----------------------------------------|
| item_id           | SERIAL PK  |                                        |
| order_id          | INTEGER FK |                                        |
| product_id        | INTEGER FK | Can be NULL (if product deleted)       |
| quantity          | INTEGER    |                                        |
| price_at_sale     | NUMERIC    | Snapshot of price at order time        |
| returned_quantity | INT (def 0)| Tracks partial returns                 |
```

### 5.6 `ledger` Table
```
| Column      | Type       | Notes                              |
|-------------|------------|------------------------------------|
| ledger_id   | SERIAL PK  |                                    |
| shop_id     | INTEGER FK |                                    |
| description | VARCHAR    | e.g., "Order Delivered (ID: 5)"    |
| debit       | NUMERIC    | Goods given on credit              |
| credit      | NUMERIC    | Payment received                   |
| balance     | NUMERIC    | Running balance                    |
| date        | TIMESTAMP  | DB-generated                       |
```

### 5.7 `expenses` Table
```
| Column      | Type       | Notes                          |
|-------------|------------|--------------------------------|
| expense_id  | SERIAL PK  |                                |
| description | VARCHAR    |                                |
| amount      | NUMERIC    |                                |
| category    | VARCHAR    | "fuel" / "salary" / etc.       |
| date        | TIMESTAMP  | DB-generated                   |
```

---

## 6. COMPLETE API ENDPOINTS

### 6.1 Public Endpoints (No JWT Required)
| Method | Endpoint       | Controller          | Description                          |
|--------|----------------|----------------------|--------------------------------------|
| GET    | `/`            | HomeController       | Health check                         |
| POST   | `/login`       | UserController       | Login → returns JWT + user data      |
| POST   | `/init-admin`  | UserController       | One-time bootstrap (creates first admin, blocks if users exist) |

### 6.2 User/Auth Endpoints
| Method | Endpoint        | Roles    | Description                                |
|--------|-----------------|----------|--------------------------------------------|
| GET    | `/users`        | Admin    | List all users (without passwords)         |
| POST   | `/register`     | Admin    | Register new user (BCrypt hashed)          |
| DELETE | `/users/{id}`   | Admin    | Delete user (nullifies orders first)       |
| POST   | `/logout`       | Any Auth | Blacklist current JWT token                |

### 6.3 Product Endpoints
| Method | Endpoint                 | Roles    | Description                               |
|--------|--------------------------|----------|-------------------------------------------|
| GET    | `/products?page=&size=&search=` | Any Auth | **Paginated** product list          |
| GET    | `/products/all`          | Any Auth | Full unpaginated list (for search/booking)|
| GET    | `/products/low-stock`    | Any Auth | Products where stock ≤ minimumThreshold   |
| GET    | `/search?name=`          | Any Auth | Search by item_name or brand_name         |
| POST   | `/add-product`           | Admin    | Add new product                           |
| PUT    | `/update-product/{id}`   | Admin    | Update product fields                     |
| DELETE | `/delete-product/{id}`   | Admin    | Delete (unlinks from order_items first)   |

### 6.4 Shop Endpoints
| Method | Endpoint            | Roles         | Description                          |
|--------|---------------------|---------------|--------------------------------------|
| GET    | `/shops`            | Admin/Staff/SK| List all shops                       |
| POST   | `/add-shop`         | Admin         | Register new shop                    |
| DELETE | `/delete-shop/{id}` | Admin         | Cascade delete (items→orders→ledger→users→shop) |
| GET    | `/market-summary`   | Admin         | Sum of all shop debts                |

### 6.5 Order Endpoints
| Method | Endpoint                    | Roles          | Description                                |
|--------|-----------------------------|----------------|--------------------------------------------|
| POST   | `/book-order`               | Admin/Staff/SK | Book multi-item order + auto stock deduct  |
| GET    | `/pending-orders`           | Admin/Staff    | List pending orders                        |
| GET    | `/orders?status=`           | Admin/Staff/SK | All orders (optional status filter)        |
| GET    | `/order-items/{orderId}`    | Any Auth       | Items in order (with product names)        |
| PUT    | `/deliver-order/{order_id}` | Admin/Staff    | Deliver → update ledger + shop debt        |
| PUT    | `/cancel-order/{order_id}`  | Admin/Staff    | Cancel → restore stock                     |
| POST   | `/return-order/{orderId}`   | Admin/Staff    | Return items → restore stock + credit ledger |

### 6.6 Ledger Endpoints
| Method | Endpoint               | Roles         | Description                        |
|--------|------------------------|---------------|------------------------------------|
| POST   | `/add-transaction`     | Admin/Staff   | Manual ledger entry (debit/credit) |
| GET    | `/shop-ledger/{id}`    | Admin/Staff/SK| Shop's full ledger history (shopkeeper restricted to own shop) |

### 6.7 Expense Endpoints
| Method | Endpoint       | Roles | Description            |
|--------|----------------|-------|------------------------|
| POST   | `/add-expense` | Admin | Add business expense   |
| GET    | `/expenses`    | Admin | List all expenses      |

### 6.8 Report Endpoints (Admin Only)
| Method | Endpoint                     | Params              | Description                          |
|--------|------------------------------|----------------------|--------------------------------------|
| GET    | `/admin/staff-sales`         | —                    | Staff sales report (native SQL)      |
| GET    | `/admin/daily-report`        | —                    | Today's credit vs cash received      |
| GET    | `/admin/monthly-report`      | `month`, `year`      | Monthly transactions summary         |
| GET    | `/admin/detailed-sales`      | —                    | Complete order history with details   |
| GET    | `/admin/ledger-report`       | `period` (daily/weekly/monthly/all) | Ledger for PDF export |
| GET    | `/admin/recovery-status`     | —                    | Shops with pending dues (sorted desc)|
| GET    | `/admin/net-profit`          | `month`, `year`      | P&L: gross_sales - total_expenses    |

---

## 7. AUTHENTICATION & SECURITY

### 7.1 JWT Flow
1. User calls `POST /login` with `{ username, password }`
2. Backend verifies password with **BCrypt** (cost factor 12)
3. If valid → generates JWT containing `{ id, role }` claims
4. JWT is signed using **SHA-256 derived** HMAC key from `JWT_SECRET`
5. Token expiry: **24 hours** (86400000 ms)
6. Frontend stores token in `localStorage.token`
7. All API calls send token via `Authorization` header (raw token, no "Bearer" prefix)

### 7.2 JWT Filter (`JwtFilter.java`)
- Extends `OncePerRequestFilter`
- Skips: `/`, `/login`, `/init-admin`
- Checks token blacklist before validating
- Extracts `userId`, `role`, `rawToken` into request attributes
- Returns 401 if token missing, blacklisted, or invalid

### 7.3 Security Features
- **BCrypt** password hashing (cost 12)
- **Token Blacklist** (in-memory `ConcurrentHashMap`) — logout invalidates tokens
- **Login Rate Limiting** — 5 failed attempts → 15 min lockout
- **CORS** restricted to `ALLOWED_ORIGIN` env var (not wildcard)
- **JWT role decoded on frontend** from token payload (not localStorage)
- **Role-based authorization** enforced on BOTH frontend routes and backend endpoints
- **SQL logging disabled** (prevents data leak in logs)

### 7.4 Frontend Role Decode
```javascript
const decodeJwtRole = (token) => {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.role || null;
};
```
This function is duplicated in: `App.js`, `Sidebar.js`, `Header.js`

---

## 8. USER ROLES & ACCESS MATRIX

| Feature                | Admin ✅ | Staff ✅ | Shopkeeper ✅ |
|------------------------|:-------:|:-------:|:------------:|
| Dashboard              |    ✅    |    ❌    |      ❌       |
| Products (CRUD)        |    ✅    |    ❌    |      ❌       |
| Expenses               |    ✅    |    ❌    |      ❌       |
| Shop Management        |    ✅    |    ✅    |      ❌       |
| Shop Ledger            |    ✅    |    ✅    |  Own shop only |
| Order Booking          |    ✅    |    ✅    |      ✅       |
| Pending/All Orders     |    ✅    |    ✅    |      ❌       |
| Reports & Analytics    |    ✅    |    ❌    |      ❌       |
| User Management        |    ✅    |    ❌    |      ❌       |
| Deliver/Cancel/Return  |    ✅    |    ✅    |      ❌       |

---

## 9. FRONTEND ROUTING

```
/                    → Login page (no layout)
/dashboard           → Dashboard (admin only)
/products            → Products page (admin only)
/expenses            → Expenses page (admin only)
/shops               → Shop management (admin, staff)
/shops/:id           → Shop Ledger (admin, staff, shopkeeper)
/order-booking       → Book Order POS (admin, staff, shopkeeper)
/orders              → Orders list (admin, staff)
/reports             → Reports (admin only)
/users               → User management (admin only)
```

### Layout Structure
- `Layout.js` wraps all protected routes with `<Sidebar>` + `<Header>` + `<Outlet>`
- `Sidebar.js` shows/hides nav items based on decoded JWT role
- `Header.js` shows notifications (pending orders, low stock) and profile dropdown

---

## 10. FRONTEND COMPONENTS DETAIL

### 10.1 `App.js` — Main Entry
- `ProtectedRoute` component: checks JWT in localStorage, decodes role, blocks unauthorized
- `<Toaster>` configured with glassmorphism styling
- All routes wrapped in `<Layout>` except login

### 10.2 `config.js` — API URL
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : `http://${window.location.hostname}:5000`;
```

### 10.3 `DataGrid.js` — Reusable Table
- Props: `columns[]` (header, field, render), `data[]`, `actions(row)`
- Used across Products, Shops, Users, Orders, etc.

### 10.4 `Sidebar.js` — Navigation
- Role-filtered nav items array
- Collapse/expand toggle
- Shopkeeper gets "My Ledger" link using `localStorage.shop_id`
- Logout calls `POST /logout` then clears localStorage

### 10.5 `Header.js` — Top Bar
- Notifications: fetches pending orders count + low stock count on mount
- Profile dropdown with username + role display
- Mobile hamburger toggle

---

## 11. KEY BUSINESS LOGIC

### 11.1 Order Lifecycle
```
Book Order → status: "pending" → Stock deducted automatically
    ↓
Deliver Order → status: "delivered" → Ledger DEBIT entry + Shop debt increased
    ↓
Return Items → status: "partially returned" or "returned"
              → Stock RESTORED + Ledger CREDIT entry + Shop debt decreased
    
Cancel Order → status: "cancelled" → Stock RESTORED (no ledger change)
```

### 11.2 Ledger Balance Calculation
- New balance = last entry's balance + debit - credit
- Shop's `total_debt` is ALWAYS updated to match latest ledger balance
- Debit = goods given on credit (udhaar)
- Credit = payment received (recovery)

### 11.3 Product Stock Management
- Stock auto-deducted on `book-order` via `productRepository.reduceStock()`
- Stock auto-restored on `cancel-order` via `productRepository.restoreStock()`
- Stock auto-restored on `return-order` via `productRepository.restoreStock()`
- Low stock alert: products where `stock ≤ minimum_threshold` (default 10)

### 11.4 Shop Deletion Cascade (Manual)
Order: `deleteByShopId → OrderItems → Orders → Ledger → Users(nullify shop_id) → Shop`

### 11.5 Product Deletion (Soft-Unlink)
Before deleting product → all linked OrderItems have `product_id` set to NULL

### 11.6 User Deletion
Before deleting user → all linked Orders have `user_id` set to NULL

---

## 12. ENVIRONMENT VARIABLES

### Backend (.env file — erp-backend/.env)
```
DB_PASSWORD=81961                              # PostgreSQL password
JWT_SECRET=ErpMS@Secure#2026$RandomKey!XyZ789  # JWT signing secret
ALLOWED_ORIGIN=http://localhost:3000             # CORS origin
```

### application.properties mapping:
```
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/postgres}
spring.datasource.username=${PGUSER:postgres}
spring.datasource.password=${PGPASSWORD:${DB_PASSWORD}}
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000
server.port=${PORT:${SERVER_PORT:5000}}
spring.jpa.hibernate.ddl-auto=update           # Auto-creates/updates tables
```

### Frontend (for production on Vercel):
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

---

## 13. DEPLOYMENT CONFIG

### Backend (Railway)
- `railway.json` and `nixpacks.toml` configure Railway deployment
- `Dockerfile` available for Docker-based deployment
- Port set via `PORT` env var

### Frontend (Vercel)
- `vercel.json`:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "build",
    "framework": "create-react-app",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 14. CSS & STYLING PATTERNS

- **Main styles:** `App.css` (15KB) — contains all layout, sidebar, grid, form styles
- **Modern UI:** `pages/ModernUI.css` (10KB) — glassmorphism, gradients, animations, modern cards
- **Dashboard:** `pages/DashboardStyles.css` — bento-box grid layout
- **Products:** `pages/Products.css` — product page specific styles
- **Design System:** Glassmorphism theme with:
  - `rgba()` backgrounds with `backdrop-filter: blur()`
  - Gradient buttons and accent colors
  - `SweetAlert2` custom classes: `glass-form-card`, `gradient-title`, `btn-gradient-success`, `btn-gradient-danger`

---

## 15. KEY CODE PATTERNS & CONVENTIONS

### Backend Patterns
- **No Service Layer** — Controllers directly use Repositories (simple architecture)
- **Role check pattern:** `if (!"admin".equalsIgnoreCase(role)) return 403`
- **Role from JWT:** `@RequestAttribute("role") String role` (set by JwtFilter)
- **User ID from JWT:** `@RequestAttribute("userId") Integer userId`
- **JSON responses:** Always use `Map<String, Object>` or `ResponseEntity<?>`
- **Transactions:** `@Transactional` on methods that modify multiple tables
- **Entity references:** Use IDs (not JPA relations) — all FK fields are simple Integer/String
- **Product table name:** Always quoted `"ERP-MS"` in native SQL queries

### Frontend Patterns
- **API calls:** `axios.get/post/put/delete(API_BASE_URL + endpoint, { headers: { Authorization: token } })`
- **Auth token:** `localStorage.getItem('token')` — sent as raw JWT in `Authorization` header (NO "Bearer" prefix)
- **localStorage items:** `token`, `username`, `shop_id`
- **State management:** React `useState` + `useEffect` — no Redux or context
- **Notifications:** `react-hot-toast` for success/error, `SweetAlert2` for confirmations
- **Data display:** Custom `DataGrid` component or inline `<table>` elements
- **PDF generation:** `jsPDF` + `jsPDF-AutoTable` in Reports page

---

## 16. IMPORTANT GOTCHAS & QUIRKS

1. **Product table name is `"ERP-MS"`** (with quotes and hyphen) — requires `@Table(name = "\"ERP-MS\"")` in Java and `"ERP-MS"` in native SQL
2. **User's `shop_id` is String type** (not Integer) — comparison uses `.toString()` and `.equals()`
3. **No "Bearer" prefix** in Authorization header — frontend sends raw JWT token
4. **JWT role decoded client-side** from token payload — `decodeJwtRole()` function is duplicated in 3 files (App.js, Sidebar.js, Header.js)
5. **No Service layer** — all business logic is in Controllers
6. **`order_date` and `date` fields** are DB-generated (`insertable=false, updatable=false`)
7. **Cascade deletes are manual** — ShopController manually deletes OrderItems → Orders → Ledger → etc.
8. **`Login.js` exists in two places** — `src/Login.js` (old, unused) and `src/pages/Login.js` (active)
9. **Products pagination:** `/products` returns Page object; `/products/all` returns full list
10. **`DBCheck.java`** is an empty/stub file (not used)
11. **`replace_alerts.py` / `replace_toasts.py`** — Python utility scripts in frontend root (not part of React app)
12. **Spring `ddl-auto=update`** — tables are auto-created/updated on startup (no migration scripts)

---

## 17. HOW TO RUN LOCALLY

### Quick Start (Windows)
```
Double-click: start_project.bat
```
This starts both backend (Spring Boot on port 5000) and frontend (React on port 3000).

### Manual Start
```bash
# Terminal 1 — Backend
cd erp-backend
mvnw.cmd spring-boot:run

# Terminal 2 — Frontend
cd erp-frontend
npm start
```

### First Time Setup
1. Start PostgreSQL on `localhost:5432`
2. Create database or use default `postgres` database
3. Start backend — JPA will auto-create all tables
4. Call `POST /init-admin` with `{ "username": "admin", "password": "yourpass" }` to create first admin
5. Login at `http://localhost:3000`

---

## 18. FRONTEND PAGE SIZES (Reference)

| Page             | File Size | Description                                |
|------------------|-----------|--------------------------------------------|
| Dashboard.js     | 25KB      | Bento grid, charts, stats, quick actions   |
| Products.js      | 25KB      | CRUD, pagination, search, low-stock tab    |
| OrderBooking.js  | 17KB      | POS cart system                            |
| Reports.js       | 17KB      | Multiple report tabs                       |
| Orders.js        | 17KB      | Order list with deliver/cancel/return      |
| Shops.js         | 13KB      | Shop management + view ledger links        |
| Users.js         | 10KB      | User CRUD                                  |
| ShopLedger.js    | 9.7KB     | Individual shop ledger view                |
| Expenses.js      | 8.8KB     | Expense tracking                           |
| Login.js (pages) | 3.5KB     | Login form                                 |

---

> **📌 TIP FOR AI/DEVELOPERS:** Before making ANY changes, read this file first. It contains
> everything you need to understand the project architecture, data flow, API contracts,
> security model, and code conventions. No need to scan the entire codebase.
