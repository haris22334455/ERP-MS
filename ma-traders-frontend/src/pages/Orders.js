import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';

const Orders = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/pending-orders`);
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDeliver = async (orderId) => {
        if (window.confirm("Confirm Delivery? Accessor will be updated.")) {
            try {
                await axios.put(`${API_BASE_URL}/deliver-order/${orderId}`);
                alert("Order Delivered & Ledger Updated!");
                fetchOrders(); // Refresh list
            } catch (err) {
                alert("Error updating order");
            }
        }
    };

    // DataGrid Config
    const orderColumns = [
        { header: 'Order ID', field: 'order_id', render: row => `#${row.order_id}` },
        { header: 'Shop ID', field: 'shop_id', render: row => `Shop #${row.shop_id}` },
        { header: 'Amount', field: 'total_amount', render: row => <strong>Rs. {row.total_amount}</strong> },
        {
            header: 'Status', field: 'status', render: row => (
                <span className={`status-pill ${row.status === 'Pending' ? 'status-warning' : 'status-success'}`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Date', field: 'order_date', render: row => new Date(row.order_date).toLocaleDateString() }
    ];

    const orderActions = (row) => (
        <button onClick={() => handleDeliver(row.order_id)} className="btn btn-success" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
            Mark as Delivered
        </button>
    );

    return (
        <div className="animate-fade-in">
            <h1>Pending Orders</h1>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: 0 }}>Orders Queue</h3>
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
