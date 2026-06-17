import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [createAccount, setCreateAccount] = useState(false);
    const [shopkeeperData, setShopkeeperData] = useState({ username: '', password: '' });
    const [newShop, setNewShop] = useState({ shop_name: '', shop_address: '' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchShops = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/shops`);
            setShops(res.data);
        } catch (err) {
            console.error("Error fetching shops:", err);
            toast.error("Failed to load shops");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const handleAddShop = async (e) => {
        e.preventDefault();

        if (createAccount) {
            if (!shopkeeperData.username || shopkeeperData.username.trim() === '') {
                toast.error("Shopkeeper Username is required");
                return;
            }
            if (!shopkeeperData.password || shopkeeperData.password.length < 6) {
                toast.error("Password must be at least 6 characters long");
                return;
            }
        }

        try {
            // 1. Create Shop
            const shopRes = await axios.post(`${API_BASE_URL}/add-shop`, newShop);

            // Try to retrieve ID from response, otherwise fetch all shops to find it
            let newShopId = shopRes.data.shopId || shopRes.data.shop_id || shopRes.data.id;

            if (!newShopId) {
                // Fallback: Fetch all shops and find the one we just created by name
                const allShopsRes = await axios.get(`${API_BASE_URL}/shops`);
                const createdShop = allShopsRes.data.find(s => (s.shopName || s.shop_name) === newShop.shop_name);
                if (createdShop) {
                    newShopId = createdShop.shopId || createdShop.shop_id;
                }
            }

            toast.success("Shop Added Successfully!");

            // 2. Create Shopkeeper Account (if selected)
            if (createAccount && shopkeeperData.username && shopkeeperData.password) {
                if (!newShopId) {
                    toast("Could not retrieve Shop ID. Please create user manually in 'Manage Users'.");
                } else {
                    try {
                        const registerPayload = {
                            username: shopkeeperData.username,
                            password: shopkeeperData.password,
                            role: 'shopkeeper',
                            shop_id: String(newShopId) // Ensure it's a string
                        };

                        await axios.post(`${API_BASE_URL}/register`, registerPayload);
                        toast.success("Shopkeeper Account Created Successfully!");
                    } catch (userErr) {
                        console.error("Error creating user:", userErr);
                        // Stringify the error details so user can see/screenshot them
                        const errorDetails = userErr.response?.data ? JSON.stringify(userErr.response.data) : userErr.message;
                        toast.error(`Shop created, but User Account FAILED:\n${errorDetails}`);
                    }
                }
            }

            // Reset Form
            setNewShop({ shop_name: '', shop_address: '' });
            setShopkeeperData({ username: '', password: '' });
            setCreateAccount(false);
            fetchShops();

        } catch (err) {
            console.error(err);
            const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            toast.error(`Error adding shop:\n${errorDetails}`);
        }
    };

    const handleDeleteShop = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Are you sure you want to delete this shop? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            background: 'rgba(255,255,255,0.9)',
            backdrop: 'rgba(0,0,0,0.4)',
            customClass: {
                popup: 'glass-form-card',
                title: 'gradient-title',
                confirmButton: 'btn-gradient-success',
                cancelButton: 'btn-gradient-danger'
            },
            confirmButtonText: 'Yes, proceed!'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/delete-shop/${id}`);
                toast.success("Shop Deleted Successfully");
                fetchShops();
            } catch (err) {
                console.error("Delete failed:", err);
                const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
                toast.error(`Failed to delete shop:\n${errorDetails}`);
            }
        }
    };

    // DataGrid Columns
    const shopColumns = [
        { header: 'ID', field: 'shopId' },
        { header: 'Shop Name', field: 'shopName', render: row => <strong>{row.shopName || row.shop_name}</strong> },
        { header: 'Address', field: 'shopAddress' },
        {
            header: 'Current Debt', field: 'totalDebt', render: row => {
                const debt = row.totalDebt !== undefined ? row.totalDebt : row.total_debt;
                return (
                <span className={`status-pill ${debt > 0 ? 'status-danger' : 'status-success'}`}>
                    Rs. {debt}
                </span>
                );
            }
        }
    ];

    const shopActions = (row) => {
        const id = row.shopId || row.shop_id;
        return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => navigate(`/shops/${id}`)} className="btn-gradient-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px' }}>
                View Ledger
            </button>
            <button onClick={() => handleDeleteShop(id)} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '50px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)' }}>
                Delete
            </button>
        </div>
        );
    };
    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Shops...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container" style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <h1 className="gradient-title"> Shop Management</h1>

            {/* ADD SHOP FORM */}
            <div className="glass-form-card">
                <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}> Add New Shop</h3>
                <form onSubmit={handleAddShop} className="dashboard-form">
                    <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Shop Name</label>
                            <input
                                type="text" placeholder="Enter Shop Name" required
                                className="form-input-modern"
                                value={newShop.shop_name}
                                onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Location / Address</label>
                            <input
                                type="text" placeholder="Enter Address" required
                                className="form-input-modern"
                                value={newShop.shop_address}
                                onChange={(e) => setNewShop({ ...newShop, shop_address: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Integrated User Creation */}
                    <div style={{ margin: '15px 0', padding: '15px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="checkbox"
                                id="createAccount"
                                checked={createAccount}
                                onChange={(e) => setCreateAccount(e.target.checked)}
                                style={{ width: 'auto' }}
                            />
                            <label htmlFor="createAccount" style={{ fontWeight: 600, color: 'var(--primary-800)', cursor: 'pointer' }}>
                                Create Login Account for this Shopkeeper?
                            </label>
                        </div>

                        {createAccount && (
                            <div className="form-row animate-fade-in" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Username</label>
                                    <input
                                        type="text" placeholder="e.g. shop_ali" required={createAccount}
                                        className="form-input-modern"
                                        value={shopkeeperData.username}
                                        onChange={(e) => setShopkeeperData({ ...shopkeeperData, username: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Password</label>
                                    <input
                                        type="password" placeholder="******" required={createAccount}
                                        className="form-input-modern"
                                        value={shopkeeperData.password}
                                        onChange={(e) => setShopkeeperData({ ...shopkeeperData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions" style={{marginTop: '20px'}}>
                        <button type="submit" className="btn-gradient-success">
                            Add Shop {createAccount ? '& Create Account' : ''}
                        </button>
                    </div>
                </form>
            </div>

            {/* SHOPS LIST */}
            <div className="chart-card" style={{ marginTop: '24px' }}>
                <div style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 className="chart-title" style={{ margin: 0 }}> Registered Shops</h3>
                </div>
                <div className="table-responsive">
                    <DataGrid
                        columns={shopColumns}
                        data={shops}
                        actions={shopActions}
                    />
                </div>
            </div>
        </div>
    );
};

export default Shops;
