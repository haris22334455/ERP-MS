# 📋 Project Proposal

## Enterprise Resource Planning – Management System (ERP-MS)
### ERP-MS – Wholesale Distribution Management

---

**Course:** Web Engineering  
**Submitted By:** Haris Qureshi  
**GitHub Repository:** [https://github.com/haris22334455/ERP-MS](https://github.com/haris22334455/ERP-MS)  
**Date:** April 10, 2026

---

## 1. Introduction

ERP-MS is a wholesale distribution business that supplies FMCG (Fast-Moving Consumer Goods) products to retail shops across the market. Currently, all business operations — including order booking, inventory tracking, financial ledgers, and expense management — are managed manually using paper-based registers and spreadsheets. This results in frequent errors, delayed reporting, and difficulty in tracking outstanding debts from shop owners.

This project aims to develop a **web-based Enterprise Resource Planning (ERP) system** that digitizes and automates all core business operations of ERP-MS, enabling real-time visibility into sales, inventory, finances, and staff performance.

---

## 2. Problem Statement

The current manual system at ERP-MS faces the following critical challenges:

- **Inventory Mismanagement:** No real-time tracking of stock levels, leading to over/under-stocking.
- **Untracked Debts (Udhaar):** Shop owners take goods on credit, and manual ledger-keeping leads to disputes and lost revenue.
- **No Sales Visibility:** The owner has no clear picture of daily/monthly sales, staff performance, or profit margins.
- **Order Booking Errors:** Phone-based or paper-based orders result in wrong items, wrong quantities, and missed deliveries.
- **Expense Leakage:** Business expenses (fuel, salaries, vehicle maintenance) are not tracked systematically.

---

## 3. Proposed Solution

A full-stack web application with a **React.js frontend** and a **Spring Boot (Java) backend**, connected to a **PostgreSQL database**. The system provides role-based access for three user types: **Admin (Owner)**, **Staff (Salesmen)**, and **Shopkeepers**.

---

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, React Router, Axios, CSS3 |
| **Backend** | Spring Boot (Java 21), Spring Data JPA, REST APIs |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT) |
| **PDF Generation** | jsPDF + jsPDF-AutoTable (client-side) |
| **Version Control** | Git & GitHub |
| **Dev Tools** | VS Code, Maven, npm |

---

## 5. Key Modules & Features

### 5.1 Authentication & Authorization
- Secure login with JWT token-based authentication
- Role-based access control (Admin, Staff, Shopkeeper)
- Session management with 24-hour token expiry

### 5.2 Product / Inventory Management *(Admin Only)*
- Add, update, and delete products (brand, item name, price, stock)
- Real-time stock tracking — auto-deduction on order booking
- Product search by name or brand

### 5.3 Shop Management
- Register new retail shops with name and address
- View all shops with outstanding debt balances
- Delete inactive shops

### 5.4 Order Booking System
- Multi-item order booking with shop selection
- Automatic stock deduction upon order creation
- Order status tracking (Pending → Delivered)
- Staff attribution — records which salesman booked each order

### 5.5 Financial Ledger (Udhaar/Credit System)
- Per-shop credit ledger with running balance
- Debit entries (goods delivered on credit)
- Credit entries (payments received)
- Automatic ledger update on order delivery

### 5.6 Expense Tracking
- Record business expenses with categories (fuel, salary, maintenance, etc.)
- Monthly expense summaries

### 5.7 Admin Dashboard & Reports
- **Market Summary:** Total outstanding receivables across all shops
- **Daily Report:** Day's total credit sales vs. cash received
- **Monthly Report:** Monthly sales, recovery, and net balance
- **Staff Sales Report:** Which staff member sold what, where, and how much
- **Detailed Sales History:** Complete order history with dates and statuses
- **Recovery Status:** Shops with highest pending dues
- **Profit & Loss:** Net profit = Total Sales – Total Expenses
- **PDF Reports:** Downloadable daily/weekly/monthly ledger reports

### 5.8 User Management *(Admin Only)*
- Create new users (Admin, Staff, Shopkeeper)
- Assign shopkeepers to their respective shops
- View and manage all system users

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                  │
│              React.js SPA (Port 3000)               │
│   ┌──────────┬──────────┬──────────┬──────────┐     │
│   │Dashboard │ Products │  Orders  │ Reports  │     │
│   │  Shops   │  Ledger  │  Users   │  Login   │     │
│   └──────────┴──────────┴──────────┴──────────┘     │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (HTTP/JSON)
                       ▼
┌─────────────────────────────────────────────────────┐
│              SERVER (Spring Boot - Port 5000)        │
│   ┌──────────────────────────────────────────────┐  │
│   │              REST Controllers                │  │
│   │  Product | Shop | Order | Ledger | Report    │  │
│   ├──────────────────────────────────────────────┤  │
│   │              Service Layer                   │  │
│   │       (Business Logic & Transactions)        │  │
│   ├──────────────────────────────────────────────┤  │
│   │            Repository Layer (JPA)            │  │
│   ├──────────────────────────────────────────────┤  │
│   │           JWT Authentication Filter          │  │
│   └──────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ JDBC (Port 5432)
                       ▼
┌─────────────────────────────────────────────────────┐
│                PostgreSQL Database                   │
│   Tables: products, shops, ledger, orders,          │
│           order_items, users, expenses              │
└─────────────────────────────────────────────────────┘
```

---

## 7. Database Schema

### 7.1 Products Table (`"ERP-MS"`)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Auto-increment ID |
| item_name | VARCHAR | Product name |
| brand_name | VARCHAR | Brand name |
| price | NUMERIC | Unit price |
| stock | INTEGER | Available quantity |
| company_name | VARCHAR | Parent company |

### 7.2 Shops Table
| Column | Type | Description |
|--------|------|-------------|
| shop_id | SERIAL (PK) | Auto-increment ID |
| shop_name | VARCHAR | Shop name |
| shop_address | VARCHAR | Shop location |
| total_debt | NUMERIC | Outstanding balance |

### 7.3 Users Table
| Column | Type | Description |
|--------|------|-------------|
| user_id | SERIAL (PK) | Auto-increment ID |
| username | VARCHAR (UNIQUE) | Login username |
| password | VARCHAR | Password |
| role | VARCHAR | admin / staff / shopkeeper |
| shop_id | INTEGER (FK) | Linked shop (for shopkeepers) |

### 7.4 Orders Table
| Column | Type | Description |
|--------|------|-------------|
| order_id | SERIAL (PK) | Auto-increment ID |
| shop_id | INTEGER (FK) | Target shop |
| user_id | INTEGER (FK) | Staff who booked |
| total_amount | NUMERIC | Order total |
| status | VARCHAR | pending / delivered |
| order_date | TIMESTAMP | Auto-generated |

### 7.5 Order Items Table
| Column | Type | Description |
|--------|------|-------------|
| item_id | SERIAL (PK) | Auto-increment ID |
| order_id | INTEGER (FK) | Parent order |
| product_id | INTEGER (FK) | Product reference |
| quantity | INTEGER | Quantity ordered |
| price_at_sale | NUMERIC | Price at time of sale |

### 7.6 Ledger Table
| Column | Type | Description |
|--------|------|-------------|
| ledger_id | SERIAL (PK) | Auto-increment ID |
| shop_id | INTEGER (FK) | Shop reference |
| description | VARCHAR | Transaction detail |
| debit | NUMERIC | Credit sale amount |
| credit | NUMERIC | Payment received |
| balance | NUMERIC | Running balance |
| date | TIMESTAMP | Auto-generated |

### 7.7 Expenses Table
| Column | Type | Description |
|--------|------|-------------|
| expense_id | SERIAL (PK) | Auto-increment ID |
| description | VARCHAR | Expense detail |
| amount | NUMERIC | Expense amount |
| category | VARCHAR | fuel / salary / etc. |
| date | TIMESTAMP | Auto-generated |

---

## 8. API Endpoints Summary

| # | Method | Endpoint | Description | Access |
|---|--------|----------|-------------|--------|
| 1 | GET | `/` | Server health check | Public |
| 2 | GET | `/products` | List all products | All |
| 3 | GET | `/search?name=` | Search products | All |
| 4 | POST | `/add-product` | Add new product | Admin |
| 5 | PUT | `/update-product/{id}` | Update product | Admin |
| 6 | DELETE | `/delete-product/{id}` | Delete product | Admin |
| 7 | POST | `/add-shop` | Register new shop | Admin/Staff |
| 8 | GET | `/shops` | List all shops | Admin/Staff |
| 9 | DELETE | `/delete-shop/{id}` | Delete shop | Admin |
| 10 | POST | `/add-transaction` | Add ledger entry | Admin/Staff |
| 11 | GET | `/shop-ledger/{id}` | Shop ledger history | Admin/Staff |
| 12 | GET | `/market-summary` | Total market debt | Admin |
| 13 | GET | `/users` | List all users | Admin |
| 14 | POST | `/register` | Register new user | Admin |
| 15 | POST | `/login` | User login (returns JWT) | Public |
| 16 | POST | `/book-order` | Book multi-item order | All |
| 17 | PUT | `/deliver-order/{id}` | Deliver order + update ledger | Admin |
| 18 | GET | `/pending-orders` | List pending orders | Admin/Staff |
| 19 | GET | `/admin/staff-sales` | Staff sales report | Admin |
| 20 | GET | `/admin/daily-report` | Daily balance sheet | Admin |
| 21 | GET | `/admin/monthly-report` | Monthly balance sheet | Admin (JWT) |
| 22 | GET | `/admin/detailed-sales` | Detailed sales history | Admin |
| 23 | GET | `/admin/ledger-report` | Ledger report for PDF export | Admin |
| 24 | GET | `/admin/recovery-status` | Shops with pending dues | Admin |
| 25 | POST | `/add-expense` | Add business expense | Admin |
| 26 | GET | `/admin/net-profit` | Profit & Loss summary | Admin |

---

## 9. User Roles & Access Matrix

| Feature | Admin | Staff | Shopkeeper |
|---------|:-----:|:-----:|:----------:|
| Dashboard | ✅ | ❌ | ❌ |
| Product Management | ✅ | ❌ | ❌ |
| Shop Management | ✅ | ✅ | ❌ |
| Shop Ledger | ✅ | ✅ | ❌ |
| Order Booking | ✅ | ✅ | ✅ |
| Order Management | ✅ | ✅ | ❌ |
| Reports & Analytics | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |

---

## 10. Development Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Planning & Design | Week 1 | Requirements, DB schema, wireframes |
| Phase 2: Backend Development | Week 2-3 | REST APIs, database setup, JWT auth |
| Phase 3: Frontend Development | Week 4-5 | React UI, routing, API integration |
| Phase 4: Integration & Testing | Week 6 | End-to-end testing, bug fixes |
| Phase 5: Reports & PDF | Week 7 | Admin reports, PDF generation |
| Phase 6: Deployment & Documentation | Week 8 | Final deployment, project documentation |

---

## 11. Future Enhancements

- **Mobile App:** React Native app for staff to book orders on-the-go
- **SMS/WhatsApp Notifications:** Automated alerts for order delivery and payment reminders
- **Cloud Deployment:** Host on AWS/Heroku for remote access
- **Barcode Scanning:** Quick product lookup via barcode
- **Data Analytics:** Graphical dashboards with charts (Chart.js / Recharts)
- **Multi-Warehouse Support:** Manage inventory across multiple warehouses

---

## 12. Conclusion

The ERP-MS ERP-MS system will transform a manual, error-prone wholesale distribution business into a digitally-managed, efficient operation. By leveraging modern web technologies (React.js, Spring Boot, PostgreSQL), the system ensures scalability, security, and real-time business insights. The role-based access control ensures that each user sees only what they need, while the comprehensive reporting module gives the owner complete financial visibility.

---

*Prepared for Web Engineering Course – April 2026*
