import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

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
            toast.success("User Created Successfully!");
            setFormData({ username: '', password: '', role: 'staff', shop_id: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error("Error creating user. Check console.");
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({title: 'Are you sure?', text: "Are you sure you want to delete this user?", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
        if (result.isConfirmed) {

            try {
                await axios.delete(`${API_BASE_URL}/users/${id}`);
                fetchUsers();
            } catch (err) {
                console.error(err);
                toast.error("Error deleting user");
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
        <button onClick={() => handleDelete(row.id)} style={{ padding: '6px 12px', borderRadius: '50px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(220,38,38,0.3)' }}>️ Delete</button>
    );

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <h1 className="gradient-title"> User Management</h1>

            <div className="dashboard-analytics-grid" style={{ gridTemplateColumns: '1fr' }}>
                {/* User List */}
                <div className="chart-card">
                    <h3 className="chart-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}> All Users</h3>
                    <div className="dash-table-wrapper">
                        <DataGrid
                            columns={columns}
                            data={users}
                            actions={actions}
                        />
                    </div>
                </div>

                {/* Add User Form */}
                <div className="glass-form-card">
                    <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}> Create New User</h3>
                    <form onSubmit={handleSubmit} className="dashboard-form">
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Username</label>
                            <input
                                className="form-input-modern"
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Password</label>
                            <input
                                className="form-input-modern"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Role</label>
                            <select
                                className="form-input-modern"
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
                                <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Assign Shop</label>
                                <select
                                    className="form-input-modern"
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

                        <div className="form-actions" style={{ marginTop: '30px' }}>
                            <button type="submit" className="btn-gradient-success full-width"> Create Account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Users;
