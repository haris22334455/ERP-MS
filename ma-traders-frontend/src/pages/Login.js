import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import Swal from 'sweetalert2';
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

            // Saving token and user info
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('user_id', res.data.user.id);
            localStorage.setItem('username', username);
            if (res.data.user.shop_id) {
                localStorage.setItem('shop_id', res.data.user.shop_id);
            }

            toast.success("Login Successful!");

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
            toast.error("Invalid Credentials");
        }
    };

    return (
        <div className="login-container-modern">
            <div className="login-card-modern animate-fade-in">
                <h1 className="login-title-modern">MA TRADERS</h1>
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
