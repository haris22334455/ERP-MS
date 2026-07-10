import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import toast from 'react-hot-toast';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const shopId = localStorage.getItem('shop_id');
    const token = localStorage.getItem('token');

    const fetchMyOrders = async () => {
        try {
            // Fix: Call /orders with Authorization header
            const res = await axios.get(`${API_BASE_URL}/orders`, {
                headers: { Authorization: token }
            });
            
            const allOrders = res.data;
            // Filter only this shop's orders
            const myOrdersList = allOrders.filter(o => String(o.shop_id) === String(shopId));
            
            // Sort by order_id descending (newest first)
            myOrdersList.sort((a, b) => b.order_id - a.order_id);
            setOrders(myOrdersList);
        } catch (err) {
            console.error("Error fetching my orders:", err);
            toast.error("Failed to load your order history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopId]);

    const columns = [
        { header: 'Order ID', field: 'order_id', render: (row) => <strong>#{row.order_id}</strong> },
        { header: 'Date', field: 'order_date', render: (row) => new Date(row.order_date).toLocaleDateString() },
        { header: 'Total Amount', field: 'total_amount', render: (row) => `Rs. ${row.total_amount}` },
        {
            header: 'Status',
            field: 'status',
            render: (row) => (
                <span className={`status-pill ${row.status === 'completed' ? 'status-success' : 'status-warning'}`}>
                    {row.status.toUpperCase()}
                </span>
            )
        }
    ];

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Order History...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <h1 className="gradient-title"> My Order History</h1>

            <div className="chart-card" style={{ marginTop: '24px' }}>
                <h3 className="chart-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}> All Placed Orders</h3>
                <div className="dash-table-wrapper">
                    <DataGrid
                        columns={columns}
                        data={orders}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
