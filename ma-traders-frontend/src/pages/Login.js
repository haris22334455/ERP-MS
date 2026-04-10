import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Backend ko request bhejna
            const res = await axios.post(`${API_BASE_URL}/login`, { username, password });

            // Token save karna
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('user_id', res.data.user.id);
            if (res.data.user.shop_id) {
                localStorage.setItem('shop_id', res.data.user.shop_id);
            }

            alert("Login Successful!");

            // Redirect based on Role
            const role = res.data.user.role;
            if (role === 'admin') {
                navigate("/dashboard");
            } else if (role === 'staff') {
                navigate("/orders"); // or /shops
            } else if (role === 'shopkeeper') {
                navigate("/order-booking");
            } else {
                navigate("/"); // Default fallback
            }
        } catch (err) {
            console.error(err);
            alert("Invalid Credentials");
        }
    };

    return (
        <div className="login-container">
            <div className="login-overlay"></div>
            <div className="login-content animate-fade-in">
                <h1 className="login-title">MA TRADERS</h1>
                <p className="login-subtitle">Enterprise Managment System</p>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <input
                            type="text"
                            className="login-input"
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="login-input"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-login"
                    >
                        Login to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
