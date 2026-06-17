import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sending request to backend
      const res = await axios.post('/login', { username, password });

      // Saving token and user info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user_id', res.data.user.id);
      if (res.data.user.shop_id) {
        localStorage.setItem('shop_id', res.data.user.shop_id);
      }

      toast.success("Login Successful! Token Saved.");
      window.location.href = "/dashboard"; // Redirecting to dashboard
    } catch (err) {
      // ✅ SECURITY: Handle rate-limit response (429) with a specific message
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retry_after_seconds || 900;
        const minutes = Math.ceil(retryAfter / 60);
        toast.error(`Too many failed attempts. Account locked for ${minutes} minute(s). Please try again later.`);
      } else {
        toast.error("Invalid Credentials");
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#2c3e50'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>ERP-MS Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;