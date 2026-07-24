import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'requests'
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'staff', // Default
        shop_id: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const [usersRes, shopsRes, requestsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/users`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/shops`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/register-requests`, { headers: { Authorization: token } })
            ]);
            setUsers(usersRes.data);
            setShops(shopsRes.data);
            setRequests(requestsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Error loading users list");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.username.trim()) {
            toast.error("Username is required.");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (formData.role === 'shopkeeper' && !formData.shop_id) {
            toast.error("Please assign a shop to the shopkeeper.");
            return;
        }

        try {
            const payload = {
                username: formData.username.trim(),
                password: formData.password,
                email: formData.email.trim(),
                role: formData.role,
                ...(formData.role === 'shopkeeper' && { shop_id: formData.shop_id })
            };

            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/register`, payload, { headers: { Authorization: token } });
            toast.success("User Created Successfully!");
            setFormData({ username: '', password: '', email: '', role: 'staff', shop_id: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            // Show the actual error from the server (e.g. "Password must be at least 6 characters", "Username already taken")
            const msg = err?.response?.data?.message || err?.response?.data || "Error creating user.";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        // Prevent self-deletion — would invalidate your own session
        const myId = parseInt(localStorage.getItem('user_id'));
        if (id === myId) {
            toast.error("❌ You cannot delete your own account!");
            return;
        }

        const result = await Swal.fire({title: 'Are you sure?', text: "Are you sure you want to delete this user?", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/users/${id}`, { headers: { Authorization: token } });
                toast.success("User deleted successfully!");
                fetchUsers();
            } catch (err) {
                console.error(err);
                // Show the actual error message from the server if available
                const msg = err?.response?.data?.message || err?.response?.data || "Error deleting user";
                toast.error(msg);
            }
        }
    };

    const columns = [
        { header: 'ID', field: 'user_id' },
        { header: 'Username', field: 'username', render: (row) => <strong>{row.username}</strong> },
        { header: 'Email', field: 'email' },
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
            render: (row) => row.shop_id ? shops.find(s => String(s.shop_id) === String(row.shop_id))?.shop_name || row.shop_id : '-'
        }
    ];

    const actions = (row) => (
        <button onClick={() => handleDelete(row.user_id)} style={{ padding: '6px 12px', borderRadius: '50px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(220,38,38,0.3)' }}>🗑️ Delete</button>
    );

    const handleApproveRequest = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/register-requests/${id}/approve`, {}, { headers: { Authorization: token } });
            toast.success("Request Approved! Shop & User created, Email sent.");
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error("Failed to approve request");
        }
    };

    const handleRejectRequest = async (id) => {
        const result = await Swal.fire({title: 'Reject Request?', text: "Are you sure you want to reject this registration?", icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, reject'});
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE_URL}/register-requests/${id}/reject`, {}, { headers: { Authorization: token } });
                toast.success("Request Rejected.");
                fetchUsers();
            } catch (err) {
                console.error(err);
                toast.error("Failed to reject request");
            }
        }
    };

    const requestColumns = [
        { header: 'ID', field: 'id' },
        { header: 'Full Name', field: 'fullname', render: (row) => <strong>{row.fullname}</strong> },
        { header: 'Business', field: 'businessname' },
        { header: 'Email', field: 'email' },
        { header: 'Phone', field: 'phone' }
    ];

    const requestActions = (row) => (
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleApproveRequest(row.id)} className="btn-gradient-success" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>✅ Approve</button>
            <button onClick={() => handleRejectRequest(row.id)} className="btn-gradient-danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>❌ Reject</button>
        </div>
    );

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Users...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="gradient-title">User Management</h1>
                <div style={{ display: 'flex', gap: '10px', background: '#e2e8f0', padding: '5px', borderRadius: '12px' }}>
                    <button 
                        onClick={() => setActiveTab('users')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? '#ffffff' : 'transparent', color: activeTab === 'users' ? '#3b82f6' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'users' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                        All Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'requests' ? '#ffffff' : 'transparent', color: activeTab === 'requests' ? '#3b82f6' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'requests' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                        Pending Requests {requests.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '0.75rem', marginLeft: '5px' }}>{requests.length}</span>}
                    </button>
                </div>
            </div>

            <div className="dashboard-analytics-grid" style={{ gridTemplateColumns: '1fr' }}>
                
                {activeTab === 'requests' ? (
                    <div className="chart-card animate-fade-in">
                        <h3 className="chart-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>Shopkeeper Registration Requests</h3>
                        {requests.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>No pending registration requests.</p>
                        ) : (
                            <div className="dash-table-wrapper">
                                <DataGrid
                                    columns={requestColumns}
                                    data={requests}
                                    actions={requestActions}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* User List */}
                        <div className="chart-card animate-fade-in">
                            <h3 className="chart-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>All Users</h3>
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
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Email</label>
                            <input
                                className="form-input-modern"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                </>
                )}
            </div>
        </div>
    );
};

export default Users;
