# ERP-MS - Enterprise Resource Planning (ERP) System

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)

ERP-MS is a comprehensive, full-stack Enterprise Resource Planning (ERP) web application designed to streamline inventory management, order processing, and financial tracking for wholesale and retail trading businesses.

It features a state-of-the-art **Bento-Box UI** design with glassmorphism aesthetics, making it both highly functional and visually stunning across desktop and mobile devices.

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for `Admin`, `Staff`, and `Shopkeeper` roles.
* **Premium Dashboard:** A modern, bento-box style grid layout with micro-animations, floating interactive cards, and real-time financial tracking graphs (via Recharts).
* **Inventory Management:** Full CRUD operations for managing product catalogs, stock tracking, and automated "Low Stock" status indicators.
* **Order Booking System:** An intuitive POS-style cart system allowing staff to select shops, add products to a cart, calculate totals dynamically, and dispatch orders.
* **Financial Ledger & Analytics:** Track daily/weekly cash flow, sales, recoveries, and business expenses. Includes visual line/area charts for revenue trend analysis.
* **Shop & User Management:** Manage multiple client shops and internal staff accounts seamlessly, with a self-service registration portal for shopkeepers.

## 🛠️ Technology Stack

### Frontend (erp-frontend)
* **Framework:** React.js
* **Routing:** React Router DOM
* **Data Visualization:** Recharts
* **Styling:** Custom CSS (Modern UI, Glassmorphism, Flex/Grid Layouts)
* **Feedback/Notifications:** React Hot Toast, SweetAlert2
* **API Client:** Axios

### Backend (erp-backend-node)
* **Runtime:** Node.js
* **Framework:** Express.js
* **ORM:** Prisma
* **Database:** PostgreSQL
* **Authentication:** JSON Web Tokens (JWT) & bcrypt

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **PostgreSQL** (Ensure it is running on your local machine or server)

### 1. Database & Backend Setup
```bash
cd erp-backend-node

# Install dependencies
npm install

# Configure your environment variables
# Create a .env file with DATABASE_URL and JWT_SECRET

# Run Prisma Migrations to generate the schema
npx prisma migrate dev --name init

# Start the development server
npm run dev
# OR: npx tsx src/server.ts
```
*The backend will start on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd erp-frontend

# Install dependencies
npm install

# Start the development server
npm start
```
*The frontend will start on `http://localhost:3000`*

## 📱 Responsive Design
The application is fully optimized for mobile devices. It utilizes dynamic CSS media queries, responsive sidebars, and collapsible grid systems to ensure a native-app-like experience on smaller screens.

## 📝 License
This project is licensed under the MIT License.
