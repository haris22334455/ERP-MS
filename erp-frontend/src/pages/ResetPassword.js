import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const query = useQuery();
    const token = query.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/reset-password`, { 
                token: token,
                newPassword: password
            });
            toast.success(res.data.message || "Password reset successfully!");
            navigate("/"); // Return to login
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-container-modern">
                <div className="login-card-modern animate-fade-in">
                    <h2 style={{ textAlign: 'center', color: '#ef4444' }}>Invalid Link</h2>
                    <p style={{ textAlign: 'center' }}>No reset token provided. Please use the link sent to your email.</p>
                    <button onClick={() => navigate('/')} className="btn-gradient-primary" style={{ width: '100%', marginTop: '20px' }}>Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container-modern">
            <div className="login-card-modern animate-fade-in">
                <h2 className="gradient-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Set New Password</h2>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group" style={{ position: 'relative', marginBottom: '20px' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="login-input-modern"
                            placeholder="New Password"
                            value={password}
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

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="login-input-modern"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="btn-gradient-primary"
                        style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginBottom: '15px' }}
                        disabled={loading}
                    >
                         {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
