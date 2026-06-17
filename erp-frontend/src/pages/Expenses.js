import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import toast from 'react-hot-toast';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'General'
    });

    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/expenses`);
            setExpenses(res.data);
        } catch (err) {
            console.error("Error fetching expenses:", err);
            toast.error("Error fetching expenses list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Expenses...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const payload = {
                description: formData.description,
                amount: parseFloat(formData.amount),
                category: formData.category
            };

            await axios.post(`${API_BASE_URL}/add-expense`, payload);
            toast.success("Expense Added Successfully!");
            setFormData({ description: '', amount: '', category: 'General' });
            fetchExpenses();
        } catch (err) {
            console.error("Error saving expense:", err);
            toast.error("Error adding expense");
        }
    };

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const columns = [
        { 
            header: 'Date', 
            field: 'date',
            render: (row) => row.date ? new Date(row.date).toLocaleString() : '-'
        },
        { 
            header: 'Category', 
            field: 'category',
            render: (row) => (
                <span className={`pill pill-warning`} style={{ textTransform: 'capitalize' }}>
                    {row.category}
                </span>
            )
        },
        { 
            header: 'Description', 
            field: 'description',
            render: (row) => <span className="td-bold">{row.description}</span>
        },
        { 
            header: 'Amount', 
            field: 'amount', 
            render: (row) => <strong style={{ color: '#ef4444' }}>Rs. {row.amount}</strong> 
        }
    ];

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
            <h1 className="gradient-title">💸 Expense Management</h1>

            {/* Bento Grid / Statistics */}
            <div className="bento-grid stagger-1" style={{ marginBottom: '30px' }}>
                <div className="bento-item bento-col-2 bento-row-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="icon-glow"></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: '5px 0 0 0' }}>Rs. {totalExpenses.toFixed(2)}</h2>
                </div>
                <div className="bento-item bento-col-2 bento-row-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="icon-glow"></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Transactions</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: '5px 0 0 0' }}>{expenses.length}</h2>
                </div>
            </div>

            <div className="dashboard-analytics-grid" style={{ gridTemplateColumns: '1fr', gap: '30px' }}>
                {/* Add Expense Form */}
                <div className="glass-form-card stagger-2">
                    <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}> Record New Expense</h3>
                    <form onSubmit={handleSubmit} className="dashboard-form">
                        <div className="form-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: '1 1 250px' }}>
                                <label className="form-label" style={{ fontWeight: '600', color: '#64748b' }}>Category</label>
                                <select
                                    className="form-input-modern"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label className="form-label" style={{ fontWeight: '600', color: '#64748b' }}>Amount (Rs)</label>
                                <input
                                    className="form-input-modern"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ flex: '2 1 300px' }}>
                                <label className="form-label" style={{ fontWeight: '600', color: '#64748b' }}>Description</label>
                                <input
                                    className="form-input-modern"
                                    type="text"
                                    placeholder="e.g. Office electricity bill, Shop rent"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn-gradient-success" style={{ minWidth: '150px' }}>Add Expense</button>
                        </div>
                    </form>
                </div>

                {/* Expense List Table */}
                <div className="chart-card stagger-3">
                    <h3 className="chart-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>Expense History</h3>
                    <div className="dash-table-wrapper">
                        <DataGrid
                            columns={columns}
                            data={expenses}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
