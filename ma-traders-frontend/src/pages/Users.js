import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'staff', // Default
        shop_id: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchShops();
    }, []);

    const fetchUsers = async () => {
        try {
            // Check if endpoint exists, otherwise use dummy logic or standard route
            const res = await axios.get(`${API_BASE_URL}/users`);
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            // Fallback for demo if backend route missing (REMOVE IN PROD)
            // setUsers([
            //     { id: 1, username: 'admin', role: 'admin' },
            //     { id: 2, username: 'staff1', role: 'staff' },
            // ]);
        }
    };

    const fetchShops = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/shops`);
            setShops(res.data);
        } catch (err) {
            console.error("Error fetching shops:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Payload preparation
            const payload = {
                username: formData.username,
                password: formData.password,
                role: formData.role,
                ...(formData.role === 'shopkeeper' && { shop_id: formData.shop_id })
            };

            await axios.post(`${API_BASE_URL}/register`, payload); // Assuming /register or /add-user
            alert("User Created Successfully!");
            setFormData({ username: '', password: '', role: 'staff', shop_id: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Error creating user. Check console.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`${API_BASE_URL}/users/${id}`);
                fetchUsers();
            } catch (err) {
                console.error(err);
                alert("Error deleting user");
            }
        }
    };

    const columns = [
        { header: 'ID', field: 'id' },
        { header: 'Username', field: 'username', render: (row) => <strong>{row.username}</strong> },
        {
            header: 'Role',
            field: 'role',
            render: (row) => (
                <span className={`status-pill ${row.role === 'admin' ? 'status-danger' :
                    row.role === 'shopkeeper' ? 'status-warning' :
                        'status-info'
                    }`}>
                    {row.role.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Assigned Shop',
            field: 'shop_id',
            render: (row) => row.shop_id ? shops.find(s => s.shop_id === row.shop_id)?.shop_name || row.shop_id : '-'
        }
    ];

    const actions = (row) => (
        <button onClick={() => handleDelete(row.id)} className="btn btn-danger" style={{ padding: '6px 12px' }}>Delete</button>
    );

    return (
        <div className="animate-fade-in dashboard-container">
            <h1 className="page-title">User Management</h1>

            <div className="dashboard-analytics-grid">
                {/* User List */}
                <div className="card dashboard-card">
                    <h3>All Users</h3>
                    <DataGrid
                        columns={columns}
                        data={users}
                        actions={actions}
                    />
                </div>

                {/* Add User Form */}
                <div className="card dashboard-card">
                    <h3>Create New User</h3>
                    <form onSubmit={handleSubmit} className="dashboard-form">
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Username</label>
                            <input
                                className="form-input"
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Password</label>
                            <input
                                className="form-input"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Role</label>
                            <select
                                className="form-input"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="staff">Staff</option>
                                <option value="shopkeeper">Shopkeeper</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Shop Selection (Conditional) */}
                        {formData.role === 'shopkeeper' && (
                            <div className="form-group animate-fade-in" style={{ marginBottom: '20px' }}>
                                <label className="form-label">Assign Shop</label>
                                <select
                                    className="form-input"
                                    value={formData.shop_id}
                                    onChange={e => setFormData({ ...formData, shop_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Shop --</option>
                                    {shops.map(s => (
                                        <option key={s.shop_id} value={s.shop_id}>
                                            {s.shop_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary full-width">Create Account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Users;
