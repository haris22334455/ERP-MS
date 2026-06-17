# ERP-MS - Enterprise Resource Planning (ERP) System

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)

ERP-MS is a comprehensive, full-stack Enterprise Resource Planning (ERP) web application designed to streamline inventory management, order processing, and financial tracking for wholesale and retail trading businesses.

It features a state-of-the-art **Bento-Box UI** design with glassmorphism aesthetics, making it both highly functional and visually stunning across desktop and mobile devices.

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for `Admin`, `Staff`, and `Shopkeeper` roles.
* **Premium Dashboard:** A modern, bento-box style grid layout with micro-animations, floating interactive cards, and real-time financial tracking graphs (via Recharts).
* **Inventory Management:** Full CRUD operations for managing product catalogs, stock tracking, and automated "Low Stock" status indicators.
* **Order Booking System:** An intuitive POS-style cart system allowing staff to select shops, add products to a cart, calculate totals dynamically, and dispatch orders.
* **Financial Ledger & Analytics:** Track daily/weekly cash flow, sales, recoveries, and business expenses. Includes visual line/area charts for revenue trend analysis.
* **Shop & User Management:** Manage multiple client shops and internal staff accounts seamlessly.

## 🛠️ Technology Stack

### Frontend (ma-traders-frontend)
* **Framework:** React.js
* **Routing:** React Router DOM
* **Data Visualization:** Recharts
* **Styling:** Custom CSS (Modern UI, Glassmorphism, Flex/Grid Layouts)
* **Feedback/Notifications:** React Hot Toast, SweetAlert2
* **API Client:** Axios

### Backend (ma-traders-backend)
* **Framework:** Java Spring Boot 3.3.7
* **ORM:** Spring Data JPA / Hibernate
* **Database:** PostgreSQL
* **Build Tool:** Maven

## 📸 Screenshots

*(Consider adding screenshots of your Dashboard, Order Booking page, and Inventory DataGrid here before publishing!)*

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v16+ recommended)
* **Java Development Kit (JDK 17)**
* **PostgreSQL** (Ensure it is running on your local machine or server)

### 1. Database Setup
1. Open pgAdmin or your PostgreSQL CLI.
2. Create a new database named `matraders` (or update `application.properties` with your custom DB name).
3. The Spring Boot JPA will automatically generate the required schema/tables on first run.

### 2. Backend Setup
```bash
cd ma-traders-backend
# Update src/main/resources/application.properties with your PostgreSQL credentials
# Run the Spring Boot application
mvn spring-boot:run
```
*The backend will start on `http://localhost:8080`*

### 3. Frontend Setup
```bash
cd ma-traders-frontend
# Install dependencies
npm install
# Start the development server
npm start
```
*The frontend will start on `http://localhost:3000`*

## 📱 Responsive Design
The application is fully optimized for mobile devices. It utilizes dynamic CSS media queries, responsive sidebars, and collapsible grid systems to ensure a native-app-like experience on smaller screens.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
