import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaBell, FaBars, FaSignOutAlt, FaBoxOpen, FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import Swal from 'sweetalert2';

// Decode role from JWT token
const decodeJwtRole = (token) => {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded.role || null;
    } catch {
        return null;
    }
};

const Header = ({ toggleSidebar }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const navigate = useNavigate();
    
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    const username = localStorage.getItem('username') || 'User';
    const role = decodeJwtRole(localStorage.getItem('token')) || 'Role';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const newNotifs = [];

                if (role === 'admin' || role === 'staff') {
                    // Fetch pending orders
                    const ordersRes = await axios.get(`${API_BASE_URL}/pending-orders`);
                    const pendingCount = ordersRes.data.length;
                    
                    if (pendingCount > 0) {
                        newNotifs.push({ id: 1, text: `${pendingCount} new pending orders.`, type: 'order', link: '/orders' });
                    }
                }

                if (role === 'admin') {
                    // ✅ FIX: Use /products/all (unpaginated) for low-stock count
                    const productsRes = await axios.get(`${API_BASE_URL}/products/all`, {
                        headers: { Authorization: token }
                    });
                    const lowStockCount = productsRes.data.filter(p => p.stock < 10).length;
                    
                    if (lowStockCount > 0) {
                        newNotifs.push({ id: 2, text: `${lowStockCount} products are low on stock.`, type: 'stock', link: '/products' });
                    }
                }

                setNotifications(newNotifs);
            } catch (err) {
                console.error("Error fetching notifications", err);
            }
        };

        fetchNotifications();
    }, [role]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?', 
            text: "Are you sure you want to logout?", 
            icon: 'warning', 
            showCancelButton: true, 
            background: 'rgba(255,255,255,0.9)', 
            backdrop: 'rgba(0,0,0,0.4)', 
            customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, 
            confirmButtonText: 'Yes, Logout'
        });
        if (result.isConfirmed) {
            // ✅ SECURITY: Call backend /logout to blacklist the JWT token server-side.
            // This ensures the token cannot be reused even if it was captured.
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await axios.post(`${API_BASE_URL}/logout`, {}, {
                        headers: { Authorization: token }
                    });
                } catch (err) {
                    // Even if the server call fails, we still clear local storage
                    console.warn('Logout API call failed:', err.message);
                }
            }
            localStorage.clear();
            navigate('/');
        }
    };

    const handleNotifClick = (link) => {
        setShowNotifications(false);
        navigate(link);
    };

    return (
        <header className="top-header">
            {/* Mobile Toggle */}
            <button className="mobile-toggle" onClick={toggleSidebar}>
                <FaBars />
            </button>



            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                {/* Notifications */}
                <div style={{ position: 'relative', cursor: 'pointer' }} ref={notifRef}>
                    <div onClick={() => setShowNotifications(!showNotifications)}>
                        <FaBell color="#64748B" size={20} />
                        {notifications.length > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: '#EF4444', color: 'white',
                                fontSize: '10px', padding: '2px 5px', borderRadius: '10px'
                            }}>
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    
                    {showNotifications && (
                        <div className="header-dropdown">
                            <div className="dropdown-header">Notifications ({notifications.length})</div>
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div key={notif.id} className="dropdown-item" onClick={() => handleNotifClick(notif.link)}>
                                        {notif.type === 'order' ? <FaClipboardList color="#3b82f6" /> : <FaBoxOpen color="#f59e0b" />}
                                        {notif.text}
                                    </div>
                                ))
                            ) : (
                                <div className="dropdown-item" style={{justifyContent: 'center', color: '#94a3b8'}}>
                                    No new notifications
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div style={{ position: 'relative' }} ref={profileRef}>
                    <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div style={{ textAlign: 'right' }} className="profile-text-mobile-hide">
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', textTransform: 'capitalize' }}>{username}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'capitalize' }}>{role}</div>
                        </div>
                        <FaUserCircle size={32} color="#1E293B" />
                    </div>

                    {showProfileMenu && (
                        <div className="header-dropdown">
                            <div className="dropdown-header">Logged in as {username}</div>
                            <div className="dropdown-item danger" onClick={handleLogout}>
                                <FaSignOutAlt />
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
