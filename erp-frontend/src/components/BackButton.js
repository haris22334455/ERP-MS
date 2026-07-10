import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show back button on the root Dashboard or Order Booking if it's the landing page
    if (location.pathname === '/dashboard' || location.pathname === '/' || location.pathname === '/order-booking') {
        return null;
    }

    return (
        <button 
            onClick={() => navigate(-1)} 
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'white', 
                border: '1px solid #e2e8f0', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                color: '#475569', 
                fontWeight: '600', 
                cursor: 'pointer',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; }}
        >
            <FaArrowLeft size={14} /> Back
        </button>
    );
};

export default BackButton;
