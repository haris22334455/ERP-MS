import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';
import { decodeJwtRole } from '../utils/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const role = decodeJwtRole(token);
            if (role === 'admin') navigate("/dashboard");
            else if (role === 'staff') navigate("/order-booking");
            else if (role === 'shopkeeper') navigate("/order-booking");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Sending request to backend
            const cleanEmail = email.trim();
            const cleanPassword = password.trim();
            const res = await axios.post(`${API_BASE_URL}/login`, { email: cleanEmail, password: cleanPassword });

            // ✅ SECURITY FIX: Only store the token in localStorage.
            // Role is no longer stored in localStorage — it is decoded directly
            // from the JWT token's cryptographically-signed payload in App.js,
            // so users cannot tamper with it via DevTools.
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_id', res.data.user.id);
            localStorage.setItem('email', email);
            localStorage.setItem('username', res.data.user.username);
            if (res.data.user.shop_id) {
                localStorage.setItem('shop_id', res.data.user.shop_id);
            }

            toast.success("Login Successful!");

            // Redirect based on Role (from server response — used only for redirect, not for auth)
            const role = res.data.user.role;
            if (role === 'admin') {
                navigate("/dashboard");
            } else if (role === 'staff') {
                navigate("/order-booking");
            } else if (role === 'shopkeeper') {
                navigate("/order-booking");
            } else {
                navigate("/"); // Default fallback
            }
        } catch (err) {
            console.error("Login error:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Invalid Credentials";
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Invalid Credentials");
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
                            type="email"
                            className="login-input-modern"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="login-input-modern"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingRight: '40px' }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                        <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }}>
                            Forgot Password?
                        </a>
                    </div>
                    <button
                        type="submit"
                        className="btn-gradient-primary"
                        style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginTop: '10px' }}
                    >
                         Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
