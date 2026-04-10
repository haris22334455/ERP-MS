import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [createAccount, setCreateAccount] = useState(false);
    const [shopkeeperData, setShopkeeperData] = useState({ username: '', password: '' });
    const [newShop, setNewShop] = useState({ shop_name: '', shop_address: '' });
    const navigate = useNavigate();

    const fetchShops = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/shops`);
            setShops(res.data);
        } catch (err) {
            console.error("Error fetching shops:", err);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const handleAddShop = async (e) => {
        e.preventDefault();
        try {
            // 1. Create Shop
            const shopRes = await axios.post(`${API_BASE_URL}/add-shop`, newShop);

            // Try to one retrieved ID from response, otherwise fetch all shops to find it
            let newShopId = shopRes.data.shop_id || shopRes.data.id;

            if (!newShopId) {
                // Fallback: Fetch all shops and find the one we just created by name
                const allShopsRes = await axios.get(`${API_BASE_URL}/shops`);
                const createdShop = allShopsRes.data.find(s => s.shop_name === newShop.shop_name);
                if (createdShop) {
                    newShopId = createdShop.shop_id;
                }
            }

            alert("Shop Added Successfully!");

            // 2. Create Shopkeeper Account (if selected)
            if (createAccount && shopkeeperData.username && shopkeeperData.password) {
                if (!newShopId) {
                    alert("Could not retrieve Shop ID. Please create user manually in 'Manage Users'.");
                } else {
                    try {
                        const registerPayload = {
                            username: shopkeeperData.username,
                            password: shopkeeperData.password,
                            role: 'shopkeeper',
                            shop_id: String(newShopId) // Ensure it's a string
                        };

                        console.log("Sending Register Payload:", registerPayload);

                        await axios.post(`${API_BASE_URL}/register`, registerPayload);
                        alert("Shopkeeper Account Created Successfully!");
                    } catch (userErr) {
                        console.error("Error creating user:", userErr);
                        // Stringify the error details so user can see/screenshot them
                        const errorDetails = userErr.response?.data ? JSON.stringify(userErr.response.data) : userErr.message;
                        alert(`Shop created, but User Account FAILED:\n${errorDetails}`);
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
            alert(`Error adding shop:\n${errorDetails}`);
        }
    };

    const handleDeleteShop = async (id) => {
        if (window.confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
            try {
                // Try standard REST plural
                await axios.delete(`${API_BASE_URL}/shops/${id}`);
                alert("Shop Deleted Successfully");
                fetchShops();
            } catch (err) {
                console.warn("Standard delete failed, trying fallback...", err);
                try {
                    // Try singular 'shop' endpoint (common inconsistency)
                    await axios.delete(`${API_BASE_URL}/shop/${id}`);
                    alert("Shop Deleted Successfully");
                    fetchShops();
                } catch (fallbackErr) {
                    console.error("Delete failed:", fallbackErr);
                    // Try one last desperate attempt: explicit delete-shop endpoint
                    try {
                        await axios.delete(`${API_BASE_URL}/delete-shop/${id}`);
                        alert("Shop Deleted Successfully");
                        fetchShops();
                    } catch (lastErr) {
                        alert(`Failed to delete shop. Server responded with: ${lastErr.message}`);
                    }
                }
            }
        }
    };

    // DataGrid Columns
    const shopColumns = [
        { header: 'ID', field: 'shop_id' },
        { header: 'Shop Name', field: 'shop_name', render: row => <strong>{row.shop_name}</strong> },
        { header: 'Address', field: 'shop_address' },
        {
            header: 'Current Debt', field: 'total_debt', render: row => (
                <span className={`status-pill ${row.total_debt > 0 ? 'status-danger' : 'status-success'}`}>
                    Rs. {row.total_debt}
                </span>
            )
        }
    ];

    const shopActions = (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate(`/shops/${row.shop_id}`)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                View Ledger
            </button>
            <button onClick={() => handleDeleteShop(row.shop_id)} className="btn btn-danger" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                Delete
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container">
            <h1 className="page-title">Shop Management</h1>

            {/* ADD SHOP FORM */}
            <div className="card dashboard-card">
                <h3>Add New Shop</h3>
                <form onSubmit={handleAddShop} className="dashboard-form">
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Shop Name</label>
                            <input
                                type="text" placeholder="Enter Shop Name" required
                                className="form-input"
                                value={newShop.shop_name}
                                onChange={(e) => setNewShop({ ...newShop, shop_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Location / Address</label>
                            <input
                                type="text" placeholder="Enter Address" required
                                className="form-input"
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
                            <div className="form-row animate-fade-in">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text" placeholder="e.g. shop_ali" required={createAccount}
                                        className="form-input"
                                        value={shopkeeperData.username}
                                        onChange={(e) => setShopkeeperData({ ...shopkeeperData, username: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password" placeholder="******" required={createAccount}
                                        className="form-input"
                                        value={shopkeeperData.password}
                                        onChange={(e) => setShopkeeperData({ ...shopkeeperData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            Add Shop {createAccount ? '& Create Account' : ''}
                        </button>
                    </div>
                </form>
            </div>

            {/* SHOPS LIST */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: 0 }}>Registered Shops</h3>
                </div>
                <DataGrid
                    columns={shopColumns}
                    data={shops}
                    actions={shopActions}
                />
            </div>
        </div>
    );
};

export default Shops;
