import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [ordersRes, shopsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/pending-orders`),
                axios.get(`${API_BASE_URL}/shops`)
            ]);
            setOrders(ordersRes.data);
            setShops(shopsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeliver = async (orderId) => {
        const result = await Swal.fire({title: 'Are you sure?', text: "Confirm Delivery? Accessor will be updated.", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
        if (result.isConfirmed) {
            try {
                await axios.put(`${API_BASE_URL}/deliver-order/${orderId}`);
                toast.success("Order Delivered & Ledger Updated!");
                fetchData(); // Refresh list
            } catch (err) {
                toast.error("Error updating order");
            }
        }
    };

    const handleCancel = async (orderId) => {
        const result = await Swal.fire({title: 'Are you sure?', text: "Are you sure you want to cancel this order? Stock will be restored.", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, cancel it!'});
        if (result.isConfirmed) {
            try {
                await axios.put(`${API_BASE_URL}/cancel-order/${orderId}`);
                toast.success("Order Cancelled & Stock Restored!");
                fetchData(); // Refresh list
            } catch (err) {
                toast.error("Error cancelling order");
            }
        }
    };

    const getShopName = (shopId) => {
        const shop = shops.find(s => (s.shopId || s.shop_id || s.id) === shopId);
        return shop ? (shop.shopName || shop.shop_name) : `Shop #${shopId}`;
    };

    // DataGrid Config
    const orderColumns = [
        { header: 'Order ID', field: 'orderId', render: row => `#${row.orderId}` },
        { header: 'Shop Name', field: 'shopId', render: row => <strong>{getShopName(row.shopId)}</strong> },
        { header: 'Amount', field: 'totalAmount', render: row => <strong>Rs. {row.totalAmount}</strong> },
        {
            header: 'Status', field: 'status', render: row => (
                <span className={`status-pill ${row.status && row.status.toLowerCase() === 'pending' ? 'status-warning' : 'status-success'}`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Date', field: 'orderDate', render: row => new Date(row.orderDate).toLocaleDateString() }
    ];

    const orderActions = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => handleDeliver(row.orderId)} className="btn-gradient-success" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px' }}>
                 Mark as Delivered
            </button>
            <button onClick={() => handleCancel(row.orderId)} className="btn-gradient-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px' }}>
                 Cancel Order
            </button>
        </div>
    );

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Orders...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container" style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <h1 className="gradient-title"> Pending Orders</h1>

            <div className="chart-card" style={{ marginTop: '24px' }}>
                <div style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 className="chart-title" style={{ margin: 0 }}>⏱️ Orders Queue</h3>
                </div>
                <DataGrid
                    columns={orderColumns}
                    data={orders}
                    actions={orderActions}
                />
            </div>
        </div>
    );
};

export default Orders;
