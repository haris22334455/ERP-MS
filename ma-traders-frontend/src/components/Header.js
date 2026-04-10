import React from 'react';
import { FaSearch, FaUserCircle, FaBell, FaBars } from 'react-icons/fa';

const Header = ({ toggleSidebar }) => {
    return (
        <header className="top-header">
            {/* Mobile Toggle */}
            <button className="mobile-toggle" onClick={toggleSidebar}>
                <FaBars />
            </button>

            {/* Search Bar */}
            <div className="search-bar">
                <FaSearch color="#9CA3AF" />
                <input type="text" placeholder="Search..." />
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                {/* Notifications */}
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <FaBell color="#64748B" size={20} />
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: '#EF4444', color: 'white',
                        fontSize: '10px', padding: '2px 5px', borderRadius: '10px'
                    }}>3</span>
                </div>

                {/* Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right', display: 'none', '@media(min-width: 768px)': { display: 'block' } }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Admin User</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Super Admin</div>
                    </div>
                    <FaUserCircle size={32} color="#1E293B" />
                </div>
            </div>
        </header>
    );
};

export default Header;
