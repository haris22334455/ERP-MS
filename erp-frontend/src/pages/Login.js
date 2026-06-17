import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Sending request to backend
            const res = await axios.post(`${API_BASE_URL}/login`, { username, password });

            // ✅ SECURITY FIX: Only store the token in localStorage.
            // Role is no longer stored in localStorage — it is decoded directly
            // from the JWT token's cryptographically-signed payload in App.js,
            // so users cannot tamper with it via DevTools.
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_id', res.data.user.id);
            localStorage.setItem('username', username);
            if (res.data.user.shop_id) {
                localStorage.setItem('shop_id', res.data.user.shop_id);
            }

            toast.success("Login Successful!");

            // Redirect based on Role (from server response — used only for redirect, not for auth)
            const role = res.data.user.role;
            if (role === 'admin') {
                navigate("/dashboard");
            } else if (role === 'staff') {
                navigate("/orders");
            } else if (role === 'shopkeeper') {
                navigate("/order-booking");
            } else {
                navigate("/"); // Default fallback
            }
        } catch (err) {
            // ✅ SECURITY FIX: Do not log error details to console in production
            toast.error("Invalid Credentials");
        }
    };

    return (
        <div className="login-container-modern">
            <div className="login-card-modern animate-fade-in">
                <h1 className="login-title-modern">ERP-MS</h1>
                <p className="login-subtitle-modern">Enterprise Management System</p>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <input
                            type="text"
                            className="login-input-modern"
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="login-input-modern"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-gradient-primary"
                        style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginTop: '10px' }}
                    >
                         Login to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
