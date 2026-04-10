import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Shops from './pages/Shops';
import ShopLedger from './pages/ShopLedger';
import OrderBooking from './pages/OrderBooking';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Products from './pages/Products';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Login />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page (No Layout) */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes (With Layout) */}
        <Route element={<Layout />}>

          {/* Admin Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Orders />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />

          <Route path="/products" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Products />
            </ProtectedRoute>
          } />

          {/* Shared Routes (Admin, Staff) */}
          <Route path="/shops" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Shops />
            </ProtectedRoute>
          } />
          <Route path="/shops/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ShopLedger />
            </ProtectedRoute>
          } />

          {/* Shopkeeper & Staff & Admin */}
          <Route path="/order-booking" element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'shopkeeper']}>
              <OrderBooking />
            </ProtectedRoute>
          } />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;