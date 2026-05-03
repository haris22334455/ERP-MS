import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

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
        const result = await Swal.fire({title: 'Are you sure?', text: "Confirm Delivery? Accessor will be updated.", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
        if (result.isConfirmed) {

            try {
                await axios.put(`${API_BASE_URL}/deliver-order/${orderId}`);
                toast.success("Order Delivered & Ledger Updated!");
                fetchOrders(); // Refresh list
            } catch (err) {
                toast.error("Error updating order");
            }
        }
    };

    // DataGrid Config
    const orderColumns = [
        { header: 'Order ID', field: 'orderId', render: row => `#${row.orderId}` },
        { header: 'Shop ID', field: 'shopId', render: row => `Shop #${row.shopId}` },
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
        <button onClick={() => handleDeliver(row.orderId)} className="btn-gradient-success" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px' }}>
             Mark as Delivered
        </button>
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
