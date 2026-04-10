import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const ShopLedger = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ledger, setLedger] = useState([]);

    const [transaction, setTransaction] = useState({
        description: '',
        amount: '',
        type: 'credit' // 'credit' means payment received (JAMA), 'debit' means goods given (UDHAAR)
    });

    const fetchLedger = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/shop-ledger/${id}`);
            setLedger(res.data);
            // Assuming we could fetch shop details to display name, but for now we rely on ledger or passed state. 
            // Actually common pattern is to fetch shop details separately or from list.
            // Let's assume user knows which shop they clicked. 
            // Ideally we should have a generic "Get Shop Details" endpoint. 
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLedger();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleTransaction = async (e) => {
        e.preventDefault();

        const isPaymentReceived = transaction.type === 'credit'; // DOING KHATA MGMT: 
        // In strict accounting: 
        // Credit = Paise aaye (Liability Kam hui/Asset kam hua - wait, for context of Shopkeeper: Credit = Jama)
        // Debit = Udhaar diya (Asset barha / Receivable barha)

        // BACKEND USES: debit & credit columns.
        // If I give goods (Udhaar) -> Debit increase.
        // If I receive cash (Recovery) -> Credit increase.

        const payload = {
            shop_id: id,
            description: transaction.description,
            debit: !isPaymentReceived ? transaction.amount : 0,
            credit: isPaymentReceived ? transaction.amount : 0
        };

        try {
            await axios.post(`${API_BASE_URL}/add-transaction`, payload);
            alert("Transaction Recorded!");
            setTransaction({ description: '', amount: '', type: 'credit' });
            fetchLedger();
        } catch (err) {
            alert("Error recording transaction");
        }
    };

    return (
        <div className="page-container">
            <button onClick={() => navigate('/shops')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>&larr; Back to Shops</button>

            <div className="page-header">
                <h1>Shop Ledger (Khata Register)</h1>
            </div>

            {/* ADD TRANSACTION */}
            <div className="card">
                <h3>Add New Entry</h3>
                <form onSubmit={handleTransaction}>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <select
                                value={transaction.type}
                                onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
                                className="form-control"
                            >
                                <option value="credit">Cash Received (Recovery)</option>
                                <option value="debit">Goods Given (Udhaar)</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ flex: 2 }}>
                            <input
                                type="text" placeholder="Description (e.g. Cash, Bill #123)" required
                                value={transaction.description}
                                onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <input
                                type="number" placeholder="Amount" required
                                value={transaction.amount}
                                onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <button type="submit" className="btn" style={{ backgroundColor: '#e67e22', color: 'white' }}>
                                Add Entry
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* LEDGER TABLE */}
            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th style={{ color: '#e74c3c' }}>Debit (Udhaar)</th>
                                <th style={{ color: '#2ecc71' }}>Credit (Jama)</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledger.map((entry) => (
                                <tr key={entry.ledger_id}>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                    <td>{entry.description}</td>
                                    <td style={{ color: '#e74c3c' }}>{entry.debit > 0 ? entry.debit : '-'}</td>
                                    <td style={{ color: '#2ecc71' }}>{entry.credit > 0 ? entry.credit : '-'}</td>
                                    <td style={{ fontWeight: 'bold' }}>Rs. {entry.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShopLedger;
