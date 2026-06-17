import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    // Default to collapsed on mobile (width < 768px), expanded on desktop
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

    // Close sidebar when route changes on mobile
    // (You can add useLocation here if needed)

    useEffect(() => {
        const handleResize = () => {
            setIsCollapsed(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="app-layout">
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${!isCollapsed && window.innerWidth < 768 ? 'open' : ''}`}
                onClick={() => setIsCollapsed(true)}
            />

            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

            {/* Main Content Wrapper */}
            <div className={`main-wrapper ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <Header toggleSidebar={toggleCollapse} />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
