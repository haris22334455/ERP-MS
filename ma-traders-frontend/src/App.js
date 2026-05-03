import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './pages/ModernUI.css'; // Global modern styles
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
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#1e293b',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.5)',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
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