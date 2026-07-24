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
    const [activeTab, setActiveTab] = useState('pending');

    // Modal & Return states
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [returnQuantities, setReturnQuantities] = useState({});

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [ordersRes, shopsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/orders`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/shops`, { headers: { Authorization: token } })
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
        const result = await Swal.fire({title: 'Are you sure?', text: "Confirm Delivery? Account balance will be updated.", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE_URL}/deliver-order/${orderId}`, {}, { headers: { Authorization: token } });
                toast.success("Order Delivered & Ledger Updated!");
                fetchData();
            } catch (err) {
                toast.error("Error updating order");
            }
        }
    };

    const handleCancel = async (orderId) => {
        const result = await Swal.fire({title: 'Are you sure?', text: "Are you sure you want to cancel this order? Stock will be restored.", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, cancel it!'});
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE_URL}/cancel-order/${orderId}`, {}, { headers: { Authorization: token } });
                toast.success("Order Cancelled & Stock Restored!");
                fetchData();
            } catch (err) {
                toast.error("Error cancelling order");
            }
        }
    };

    const handleOpenReturnModal = async (order) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/orders/${order.order_id}/items`, { headers: { Authorization: token } });
            setSelectedOrder(order);
            setOrderItems(res.data);
            const initialQtys = {};
            res.data.forEach(item => {
                initialQtys[item.product_id] = 0;
            });
            setReturnQuantities(initialQtys);
            setShowReturnModal(true);
        } catch (err) {
            toast.error("Failed to load order items");
        }
    };

    const handleQtyChange = (productId, val, maxQty) => {
        const parsed = parseInt(val) || 0;
        if (parsed < 0) return;
        if (parsed > maxQty) {
            toast.error(`Cannot return more than available (${maxQty})`);
            return;
        }
        setReturnQuantities({
            ...returnQuantities,
            [productId]: parsed
        });
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        const itemsToReturn = Object.entries(returnQuantities)
            .map(([productId, quantity]) => ({
                productId: parseInt(productId),
                quantity: quantity
            }))
            .filter(item => item.quantity > 0);

        if (itemsToReturn.length === 0) {
            toast.error("Please specify return quantity for at least one item.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/orders/${selectedOrder.order_id}/return`, {
                items: itemsToReturn
            }, { headers: { Authorization: token } });
            toast.success(res.data.message || "Return processed successfully!");
            setShowReturnModal(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Failed to process return";
            toast.error(msg);
        }
    };

    const getShopName = (shopId) => {
        const shop = shops.find(s => (s.shopId || s.shop_id || s.id) === shopId);
        return shop ? (shop.shopName || shop.shop_name) : `Shop #${shopId}`;
    };

    const renderStatusPill = (status) => {
        let bg = '#fee2e2'; 
        let color = '#ef4444';
        let label = status || 'UNKNOWN';

        if (status?.toLowerCase() === 'pending') {
            bg = '#fef3c7'; 
            color = '#d97706';
        } else if (status?.toLowerCase() === 'delivered') {
            bg = '#dcfce7'; 
            color = '#10b981';
        } else if (status?.toLowerCase() === 'partially returned') {
            bg = '#e0f2fe'; 
            color = '#0284c7';
        }

        return (
            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: bg, color: color }}>
                {label.toUpperCase()}
            </span>
        );
    };

    // DataGrid Config
    const orderColumns = [
        { header: 'Order ID', field: 'order_id', render: row => `#${row.order_id}` },
        { header: 'Shop Name', field: 'shop_id', render: row => <strong>{getShopName(row.shop_id)}</strong> },
        { header: 'Amount', field: 'total_amount', render: row => <strong>Rs. {row.total_amount}</strong> },
        {
            header: 'Status', field: 'status', render: row => renderStatusPill(row.status)
        },
        { header: 'Date', field: 'order_date', render: row => new Date(row.order_date).toLocaleDateString() }
    ];

    const pendingActions = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => handleDeliver(row.order_id)} className="btn-gradient-success" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px', border: 'none', cursor: 'pointer' }}>
                 Mark as Delivered
            </button>
            <button onClick={() => handleCancel(row.order_id)} className="btn-gradient-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px', border: 'none', cursor: 'pointer' }}>
                 Cancel Order
            </button>
        </div>
    );

    const historyActions = (row) => {
        const canReturn = row.status?.toLowerCase() === 'delivered' || row.status?.toLowerCase() === 'partially returned';
        return (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {canReturn ? (
                    <button onClick={() => handleOpenReturnModal(row)} className="btn-gradient-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px', border: 'none', cursor: 'pointer' }}>
                         Return Items
                    </button>
                ) : (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Non-Returnable ({row.status})</span>
                )}
            </div>
        );
    };

    const tabStyle = (name) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        fontWeight: '700',
        background: activeTab === name ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
        color: activeTab === name ? 'white' : '#64748b',
        borderRadius: '8px 8px 0 0',
        marginRight: '5px',
        borderBottom: activeTab === name ? 'none' : '2px solid transparent',
        transition: 'all 0.3s ease'
    });

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Orders...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending');
    const historyOrders = orders.filter(o => o.status?.toLowerCase() !== 'pending');

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 className="gradient-title">Order Management & Returns</h1>

            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '25px', overflowX: 'auto' }}>
                <div onClick={() => setActiveTab('pending')} style={tabStyle('pending')}>Pending Queue</div>
                <div onClick={() => setActiveTab('history')} style={tabStyle('history')}>Order History & Returns</div>
            </div>

            {activeTab === 'pending' ? (
                <div className="chart-card">
                    <div style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 className="chart-title" style={{ margin: 0 }}>⏱️ Pending Orders Queue</h3>
                    </div>
                    <DataGrid
                        columns={orderColumns}
                        data={pendingOrders}
                        actions={pendingActions}
                    />
                </div>
            ) : (
                <div className="chart-card">
                    <div style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 className="chart-title" style={{ margin: 0 }}>📦 Delivered & Returned Orders History</h3>
                    </div>
                    <DataGrid
                        columns={orderColumns}
                        data={historyOrders}
                        actions={historyActions}
                    />
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div className="glass-form-card" style={{
                        width: '100%', maxWidth: '600px', maxHeight: '85vh',
                        overflowY: 'auto', padding: '30px', margin: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', borderTop: '5px solid #3b82f6'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>
                                Process Returns for Order #{selectedOrder.order_id}
                            </h3>
                            <button onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
                        </div>
                        
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                            Shop: <strong>{getShopName(selectedOrder.shop_id)}</strong> | Date: {new Date(selectedOrder.order_date).toLocaleDateString()}
                        </p>

                        <form onSubmit={handleReturnSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                {orderItems.map(item => {
                                    const availableToReturn = item.quantity - item.returned_quantity;
                                    return (
                                        <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ color: '#1e293b' }}>{item.products?.item_name || 'Unknown'}</strong>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Brand: {item.products?.brand_name || 'N/A'} | Price: Rs. {item.price_at_sale}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                                    Bought: <span style={{ fontWeight: 600 }}>{item.quantity}</span> | Returned: <span style={{ color: '#ef4444', fontWeight: 600 }}>{item.returned_quantity}</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {availableToReturn > 0 ? (
                                                    <>
                                                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Qty to Return:</label>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            max={availableToReturn}
                                                            value={returnQuantities[item.product_id] || 0}
                                                            onChange={e => handleQtyChange(item.product_id, e.target.value, availableToReturn)}
                                                            className="form-input-modern"
                                                            style={{ width: '80px', padding: '8px' }}
                                                        />
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px' }}>Returned</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                <button type="button" onClick={() => setShowReturnModal(false)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-gradient-primary" style={{ padding: '10px 25px' }}>
                                    Process Return
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
