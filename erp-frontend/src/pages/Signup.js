import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API_BASE_URL from '../config';
import './ModernUI.css';

function Signup() {
    const [fullname, setFullname] = useState('');
    const [businessname, setBusinessname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await axios.post(`${API_BASE_URL}/register-request`, {
                fullname,
                businessname,
                email,
                phone,
                password
            });
            
            toast.success(res.data.message || 'Registration request submitted successfully!');
            navigate('/');
        } catch (err) {
            console.error("Signup error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Registration failed";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container-modern">
            <div className="login-card-modern animate-fade-in" style={{ padding: '30px', maxWidth: '450px' }}>
                <h1 className="login-title-modern">Create Account</h1>
                <p className="login-subtitle-modern" style={{ marginBottom: '25px' }}>Register your shop with ERP-MS</p>

                <form onSubmit={handleSignup} className="login-form">
                    <div className="form-group">
                        <input
                            type="text"
                            className="login-input-modern"
                            placeholder="Full Name"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="text"
                            className="login-input-modern"
                            placeholder="Shop / Business Name"
                            value={businessname}
                            onChange={(e) => setBusinessname(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="email"
                            className="login-input-modern"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="text"
                            className="login-input-modern"
                            placeholder="Phone Number (Optional)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group" style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="login-input-modern"
                            placeholder="Password"
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

                    <button type="submit" className="btn-gradient-primary w-100" style={{ marginTop: '15px', padding: '14px', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        Already have an account?{' '}
                        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
                            Login here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
