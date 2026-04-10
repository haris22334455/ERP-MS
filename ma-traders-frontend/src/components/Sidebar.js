import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaStore, FaShoppingCart, FaClipboardList, FaChartLine, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaUsers, FaBoxes } from 'react-icons/fa';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
    const location = useLocation();

    const role = localStorage.getItem('role');

    // Navigation Items
    const allNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FaHome />, roles: ['admin'] },
        { path: '/products', label: 'Products', icon: <FaBoxes />, roles: ['admin'] },
        { path: '/shops', label: 'Manage Shops', icon: <FaStore />, roles: ['admin', 'staff'] },
        { path: '/order-booking', label: 'Book Order', icon: <FaShoppingCart />, roles: ['admin', 'staff', 'shopkeeper'] },
        { path: '/orders', label: 'Pending Orders', icon: <FaClipboardList />, roles: ['admin', 'staff'] },
        { path: '/reports', label: 'Reports', icon: <FaChartLine />, roles: ['admin'] },
        { path: '/users', label: 'Manage Users', icon: <FaUsers />, roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(role));

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            {/* Header / Logo */}
            <div className="sidebar-header">
                {!isCollapsed && <span style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>MA TRADERS</span>}
                {isCollapsed && <span style={{ fontWeight: 'bold' }}>MA</span>}
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, marginTop: '20px' }}>
                {navItems.map((item) => (
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
