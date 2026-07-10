import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            toast.success(res.data.message || "Reset link sent!");
            navigate("/"); // Return to login
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container-modern">
            <div className="login-card-modern animate-fade-in">
                <h2 className="gradient-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Forgot Password</h2>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>
                    Enter your registered email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <input
                            type="email"
                            className="login-input-modern"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="btn-gradient-primary"
                        style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginBottom: '15px' }}
                        disabled={loading}
                    >
                         {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
                            &larr; Back to Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
