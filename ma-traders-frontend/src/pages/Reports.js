import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    // State
    const [activeTab, setActiveTab] = useState('daily');
    const [dailyReport, setDailyReport] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [profitReport, setProfitReport] = useState(null);

    const role = localStorage.getItem('role');

    // Inputs for Monthly/Profit
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    // Expense Form
    const [expense, setExpense] = useState({ description: '', amount: '', category: 'General' });

    // Fetch Functions
    const fetchDaily = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/daily-report`);
            setDailyReport(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchMonthly = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/monthly-report?month=${month}&year=${year}`, {
                headers: { Authorization: token }
            });
            setMonthlyReport(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProfit = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/net-profit?month=${month}&year=${year}`);
            setProfitReport(res.data);
        } catch (err) { console.error(err); }
    };

    // Load Data based on Tab
    useEffect(() => {
        if (activeTab === 'daily') fetchDaily();
        if (activeTab === 'monthly') fetchMonthly();
        if (activeTab === 'profit') fetchProfit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, month, year]);

    // Handle Expense Submit
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/add-expense`, expense);
            alert("Expense Added!");
            setExpense({ description: '', amount: '', category: 'General' });
            if (activeTab === 'profit') fetchProfit(); // Update profit if viewing
        } catch (err) {
            alert("Error adding expense");
        }
    };

    // Download PDF Report
    const downloadPDF = async (period) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/ledger-report?period=${period}`);
            const data = res.data;

            if (!data || data.length === 0) {
                alert(`No transactions found for the selected period (${period}).`);
                return;
            }

            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.text(`MA Traders - ${period.charAt(0).toUpperCase() + period.slice(1)} Ledger Report`, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            // Table Data Mapping
            const tableColumns = ["Date", "Shop Name", "Description", "Cash In (Rs)", "Cash Out (Rs)", "Balance"];
            const tableRows = [];

            data.forEach(item => {
                tableRows.push([
                    item.formatted_date,
                    item.shop_name || 'Walk-in / General',
                    item.description || '-',
                    item.cash_in || 0,
                    item.cash_out || 0,
                    item.balance || 0
                ]);
            });

            // Generate Table
            autoTable(doc, {
                startY: 40,
                head: [tableColumns],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
                alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate 50
            });

            doc.save(`MA_Traders_${period}_Report.pdf`);
        } catch (err) {
            console.error(err);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    // TAB STYLES
    const tabStyle = (name) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        fontWeight: '600',
        backgroundColor: activeTab === name ? 'var(--primary-800)' : 'transparent',
        color: activeTab === name ? 'white' : 'var(--text-secondary)',
        borderRadius: '8px 8px 0 0',
        marginRight: '5px',
        borderBottom: activeTab === name ? 'none' : '2px solid transparent',
        transition: 'all 0.2s'
    });

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <h1>Business Reports</h1>

                {/* ADMIN PDF CONTROLS */}
                {role === 'admin' && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary-800)' }}><i className="fas fa-file-pdf" style={{ color: '#ef4444', marginRight: '5px' }}></i> Export PDF:</span>
                        <button onClick={() => downloadPDF('daily')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Daily</button>
                        <button onClick={() => downloadPDF('weekly')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Weekly</button>
                        <button onClick={() => downloadPDF('monthly')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Monthly</button>
                    </div>
                )}
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '25px', overflowX: 'auto' }}>
                <div onClick={() => setActiveTab('daily')} style={tabStyle('daily')}>Daily Report</div>
                <div onClick={() => setActiveTab('monthly')} style={tabStyle('monthly')}>Monthly Report</div>
                <div onClick={() => setActiveTab('profit')} style={tabStyle('profit')}>Net Profit & Expenses</div>
            </div>

            {/* DAILY REPORT CONTENT */}
            {activeTab === 'daily' && dailyReport && (
                <div className="card">
                    <h2 style={{ color: 'var(--primary-800)', marginBottom: '20px' }}>Daily Snapshot ({dailyReport.date})</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <Card title="Sales on Credit" value={dailyReport.summary.total_sales_on_credit} color="var(--danger-text)" bg="var(--danger-bg)" textColor="var(--danger-text)" />
                        <Card title="Cash Received" value={dailyReport.summary.total_cash_received} color="var(--success-text)" bg="var(--success-bg)" textColor="var(--success-text)" />
                        <Card title="Net Balance Change" value={dailyReport.summary.net_balance} color="var(--info-text)" bg="var(--info-bg)" textColor="var(--info-text)" />
                    </div>
                </div>
            )}

            {/* MONTHLY REPORT CONTENT */}
            {activeTab === 'monthly' && (
                <div className="card">
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '8px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Month: </label>
                        <input type="number" value={month} onChange={e => setMonth(e.target.value)} className="form-input" style={{ width: '80px', display: 'inline-block' }} />
                        <label className="form-label" style={{ marginBottom: 0 }}>Year: </label>
                        <input type="number" value={year} onChange={e => setYear(e.target.value)} className="form-input" style={{ width: '100px', display: 'inline-block' }} />
                        <button onClick={fetchMonthly} className="btn btn-primary" style={{ marginLeft: '10px' }}>Refresh Data</button>
                    </div>

                    {monthlyReport && (
                        <div>
                            <h2 style={{ color: 'var(--primary-800)', marginBottom: '20px' }}>Monthly Performance</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                <Card title="Total Transactions" value={monthlyReport.total_transactions} bg="#F1F5F9" textColor="var(--text-primary)" prefix="" />
                                <Card title="Total Sales" value={monthlyReport.monthly_sales} color="var(--emerald-600)" bg="var(--bg-surface)" textColor="var(--emerald-600)" hasBorder />
                                <Card title="Total Recovery" value={monthlyReport.monthly_recovery} color="var(--info-text)" bg="var(--bg-surface)" textColor="var(--info-text)" hasBorder />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PROFIT & EXPENSE CONTENT */}
            {activeTab === 'profit' && (
                <div>
                    <div className="card">
                        <h3>Add Business Expense</h3>
                        <form onSubmit={handleExpenseSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 2 }}>
                                    <label className="form-label">Description</label>
                                    <input type="text" placeholder="e.g. Electric Bill" required
                                        value={expense.description} onChange={e => setExpense({ ...expense, description: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Amount</label>
                                    <input type="number" placeholder="Amount" required
                                        value={expense.amount} onChange={e => setExpense({ ...expense, amount: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Category</label>
                                    <select value={expense.category} onChange={e => setExpense({ ...expense, category: e.target.value })} className="form-input">
                                        <option>General</option>
                                        <option>Salary</option>
                                        <option>Maintenance</option>
                                        <option>Rent</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-danger" style={{ height: '42px' }}>Add Expense</button>
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '8px' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Month: </label>
                            <input type="number" value={month} onChange={e => setMonth(e.target.value)} className="form-input" style={{ width: '80px', display: 'inline-block' }} />
                            <label className="form-label" style={{ marginBottom: 0 }}>Year: </label>
                            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="form-input" style={{ width: '100px', display: 'inline-block' }} />
                            <button onClick={fetchProfit} className="btn btn-primary" style={{ marginLeft: '10px' }}>Refresh</button>
                        </div>

                        {profitReport && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <h2 style={{ color: 'var(--text-secondary)' }}>Net Profit Calculation</h2>
                                <h1 style={{ fontSize: '48px', margin: '20px 0', color: profitReport.status === 'Profit' ? 'var(--success-text)' : 'var(--danger-text)' }}>
                                    Rs. {profitReport.net_profit}
                                </h1>
                                <div style={{ display: 'inline-block', padding: '10px 20px', background: '#F1F5F9', borderRadius: '50px' }}>
                                    <span style={{ marginRight: '15px' }}><strong>Sales:</strong> Rs. {profitReport.gross_sales}</span>
                                    <span><strong>Expenses:</strong> Rs. {profitReport.total_expenses}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Card Component
const Card = ({ title, value, color, bg, textColor, prefix = "Rs. ", hasBorder }) => (
    <div style={{
        padding: '25px',
        backgroundColor: bg || 'white',
        borderRadius: '12px',
        color: textColor || 'var(--text-primary)',
        textAlign: 'center',
        border: hasBorder || color ? `1px solid ${color || 'transparent'}` : '1px solid var(--border-color)',
        boxShadow: bg ? 'none' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <h3 style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: textColor || 'var(--text-secondary)' }}>{title}</h3>
        <span style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{prefix}{value || 0}</span>
    </div>
);

export default Reports;
