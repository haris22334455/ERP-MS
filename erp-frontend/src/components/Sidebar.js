import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaStore, FaShoppingCart, FaClipboardList, FaChartLine, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaUsers, FaBoxes, FaMoneyBillWave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import API_BASE_URL from '../config';

import { decodeJwtRole } from '../utils/auth';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
    const location = useLocation();

    const token = localStorage.getItem('token');
    const role = decodeJwtRole(token);
    const shopId = localStorage.getItem('shop_id');

    // Navigation Groups
    const navGroups = [
        {
            groupName: 'OVERVIEW',
            roles: ['admin'],
            items: [
                { path: '/dashboard', label: 'Dashboard', icon: <FaHome />, roles: ['admin'] }
            ]
        },
        {
            groupName: 'INVENTORY',
            roles: ['admin'],
            items: [
                { path: '/products', label: 'Products', icon: <FaBoxes />, roles: ['admin'] }
            ]
        },
        {
            groupName: 'ORDERS',
            roles: ['admin', 'staff', 'shopkeeper'],
            items: [
                { path: '/order-booking', label: 'Book Order', icon: <FaShoppingCart />, roles: ['staff', 'shopkeeper'] },
                { path: '/my-orders', label: 'My Orders', icon: <FaClipboardList />, roles: ['shopkeeper'] },
                { path: '/orders', label: 'Manage Orders', icon: <FaClipboardList />, roles: ['admin', 'staff'] }
            ]
        },
        {
            groupName: 'SHOPS & LEDGER',
            roles: ['admin', 'shopkeeper'],
            items: [
                { path: '/shops', label: 'Manage Shops', icon: <FaStore />, roles: ['admin'] },
                { path: `/shops/${shopId || ''}`, label: 'My Ledger', icon: <FaStore />, roles: ['shopkeeper'] }
            ]
        },
        {
            groupName: 'FINANCE',
            roles: ['admin'],
            items: [
                { path: '/expenses', label: 'Expenses', icon: <FaMoneyBillWave />, roles: ['admin'] },
                { path: '/reports', label: 'Reports', icon: <FaChartLine />, roles: ['admin'] }
            ]
        },
        {
            groupName: 'SETTINGS',
            roles: ['admin'],
            items: [
                { path: '/users', label: 'Manage Users', icon: <FaUsers />, roles: ['admin'] }
            ]
        }
    ];

    const handleLogout = async () => {
        const result = await Swal.fire({title: 'Are you sure?', text: "Are you sure you want to logout?", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
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
                    console.warn('Logout API call failed:', err.message);
                }
            }
            localStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            {/* Header / Logo */}
            <div className="sidebar-header">
                {!isCollapsed && <span style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>ERP-MS</span>}
                {isCollapsed && <span style={{ fontWeight: 'bold' }}>MA</span>}
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, marginTop: '10px', overflowY: 'auto' }}>
                {navGroups.filter(g => g.roles.includes(role)).map((group, index) => (
                    <div key={index} style={{ marginBottom: '15px' }}>
                        {!isCollapsed && (
                            <div style={{ padding: '0 20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', letterSpacing: '0.05em', marginBottom: '5px' }}>
                                {group.groupName}
                            </div>
                        )}
                        {group.items.filter(item => item.roles.includes(role)).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Collapse Toggle (Desktop only) */}
            <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end' }}>
                <button
                    onClick={toggleCollapse}
                    style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '1.2rem', color: '#EF4444' }}><FaSignOutAlt /></span>
                {!isCollapsed && <span style={{ color: '#EF4444' }}>Logout</span>}
            </button>
        </div>
    );
};

export default Sidebar;
