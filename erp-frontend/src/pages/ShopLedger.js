import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';

// Decode role from JWT token (same approach as App.js & Sidebar.js)
const decodeJwtRole = (token) => {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded.role || null;
    } catch {
        return null;
    }
};

const ShopLedger = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);

    const [transaction, setTransaction] = useState({
        description: '',
        amount: '',
        type: 'credit' // 'credit' means payment received (CREDIT), 'debit' means goods given (DEBIT)
    });

    const token = localStorage.getItem('token');
    const role = decodeJwtRole(token);
    const userShopId = localStorage.getItem('shop_id');

    const fetchLedger = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/shop-ledger/${id}`);
            setLedger(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load ledger details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleTransaction = async (e) => {
        e.preventDefault();

        const isPaymentReceived = transaction.type === 'credit'; // ACCOUNTING LOGIC: 
        // In strict accounting: 
        // Credit = Cash received (Liability decreases / Asset decreases - wait, for context of Shopkeeper: Credit = Payment Received)
        // Debit = Goods given on credit (Asset increases / Receivable increases)

        // BACKEND USES: debit & credit columns.
        // If I give goods on credit -> Debit increases.
        // If I receive cash (Recovery) -> Credit increases.

        const payload = {
            shop_id: id,
            description: transaction.description,
            debit: !isPaymentReceived ? transaction.amount : 0,
            credit: isPaymentReceived ? transaction.amount : 0
        };

        try {
            await axios.post(`${API_BASE_URL}/add-transaction`, payload);
            toast.success("Transaction Recorded!");
            setTransaction({ description: '', amount: '', type: 'credit' });
            fetchLedger();
        } catch (err) {
            toast.error("Error recording transaction");
        }
    };
    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Ledger Details...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container" style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

            {/* Access Denied for shopkeepers trying to view another shop */}
            {role === 'shopkeeper' && String(id) !== String(userShopId) ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                    <div className="glass-form-card text-center" style={{ padding: '40px', maxWidth: '500px', borderTop: '5px solid #ef4444' }}>
                        <h2 style={{ color: '#ef4444', fontWeight: '800', marginBottom: '15px' }}>Access Denied</h2>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
                            You are not authorized to view the ledger history of this shop. You can only view your own shop ledger.
                        </p>
                    </div>
                </div>
            ) : (
            <>
            {role !== 'shopkeeper' && (
                <button onClick={() => navigate('/shops')} className="btn-gradient-primary" style={{ marginBottom: '20px', borderRadius: '50px', padding: '8px 16px', background: 'linear-gradient(135deg, #64748b, #475569)' }}>&larr; Back to Shops</button>
            )}

            <div className="page-header" style={{ marginBottom: '25px' }}>
                <h1 className="gradient-title" style={{ margin: 0 }}> Shop Ledger</h1>
            </div>

            {/* ADD TRANSACTION */}
            {role !== 'shopkeeper' && (
                <div className="glass-form-card" style={{ marginBottom: '25px' }}>
                    <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}> Add New Entry</h3>
                    <form onSubmit={handleTransaction}>
                        <div className="form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                                <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Transaction Type</label>
                                <select
                                    value={transaction.type}
                                    onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
                                    className="form-input-modern"
                                >
                                    <option value="credit"> Cash Received (Recovery)</option>
                                    <option value="debit"> Goods Given on Credit</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ flex: 2, minWidth: '250px' }}>
                                <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Description</label>
                                <input
                                    type="text" placeholder="e.g. Cash, Bill #123" required
                                    value={transaction.description}
                                    onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                                    className="form-input-modern"
                                />
                            </div>

                            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                                <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Amount (Rs)</label>
                                <input
                                    type="number" placeholder="0.00" required
                                    value={transaction.amount}
                                    onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                                    className="form-input-modern"
                                />
                            </div>

                            <div className="form-group" style={{ width: '100%' }}>
                                <button type="submit" className="btn-gradient-success full-width" style={{ marginTop: '10px' }}>
                                     Add Entry
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* LEDGER TABLE */}
            <div className="chart-card">
                <div className="dash-table-wrapper">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th style={{ color: '#dc2626' }}>Debit (Given)</th>
                                <th style={{ color: '#059669' }}>Credit (Received)</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledger.map((entry) => (
                                <tr key={entry.ledger_id}>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                    <td className="td-bold">{entry.description}</td>
                                    <td style={{ color: '#dc2626', fontWeight: entry.debit > 0 ? '600' : 'normal' }}>{entry.debit > 0 ? entry.debit : '-'}</td>
                                    <td style={{ color: '#059669', fontWeight: entry.credit > 0 ? '600' : 'normal' }}>{entry.credit > 0 ? entry.credit : '-'}</td>
                                    <td style={{ fontWeight: 'bold' }}>Rs. {entry.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
            </>
            )}
        </div>
    );
};

export default ShopLedger;
