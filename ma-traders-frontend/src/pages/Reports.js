import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

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
            toast.success("Expense Added!");
            setExpense({ description: '', amount: '', category: 'General' });
            if (activeTab === 'profit') fetchProfit(); // Update profit if viewing
        } catch (err) {
            toast.error("Error adding expense");
        }
    };

    // Download PDF Report
    const downloadPDF = async (period) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/ledger-report?period=${period}`);
            const data = res.data;

            if (!data || data.length === 0) {
                toast(`No transactions found for the selected period (${period}).`);
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
            toast.error("Failed to generate PDF. Check console for details.");
        }
    };

    // TAB STYLES
    const tabStyle = (name) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        fontWeight: '600',
        background: activeTab === name ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
        color: activeTab === name ? 'white' : '#64748b',
        borderRadius: '8px 8px 0 0',
        marginRight: '5px',
        borderBottom: activeTab === name ? 'none' : '2px solid transparent',
        transition: 'all 0.3s ease'
    });

    return (
        <div className="animate-fade-in dashboard-container" style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h1 className="gradient-title" style={{ margin: 0 }}> Business Reports</h1>

                {/* ADMIN PDF CONTROLS */}
                {role === 'admin' && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}><FaFilePdf style={{ color: '#ef4444', marginRight: '5px' }} /> Export PDF:</span>
                        <button onClick={() => downloadPDF('daily')} className="btn-gradient-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '50px' }}>Daily</button>
                        <button onClick={() => downloadPDF('weekly')} className="btn-gradient-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '50px' }}>Weekly</button>
                        <button onClick={() => downloadPDF('monthly')} className="btn-gradient-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '50px' }}>Monthly</button>
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
                <div className="chart-card">
                    <h2 className="chart-title">Daily Snapshot ({dailyReport.date})</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <Card title="Sales on Credit" value={dailyReport.summary.total_sales_on_credit} color="rgba(239, 68, 68, 0.3)" bg="#fef2f2" textColor="#dc2626" />
                        <Card title="Cash Received" value={dailyReport.summary.total_cash_received} color="rgba(16, 185, 129, 0.3)" bg="#ecfdf5" textColor="#059669" />
                        <Card title="Net Balance Change" value={dailyReport.summary.net_balance} color="rgba(59, 130, 246, 0.3)" bg="#eff6ff" textColor="#2563eb" />
                    </div>
                </div>
            )}

            {/* MONTHLY REPORT CONTENT */}
            {activeTab === 'monthly' && (
                <div className="chart-card">
                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: '#f1f5f9', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <label className="form-label" style={{ marginBottom: 0, fontWeight: '600' }}>Month: </label>
                        <input type="number" value={month} onChange={e => setMonth(e.target.value)} className="form-input-modern" style={{ width: '80px' }} />
                        <label className="form-label" style={{ marginBottom: 0, fontWeight: '600' }}>Year: </label>
                        <input type="number" value={year} onChange={e => setYear(e.target.value)} className="form-input-modern" style={{ width: '100px' }} />
                        <button onClick={fetchMonthly} className="btn-gradient-primary" style={{ marginLeft: '10px' }}>Refresh Data</button>
                    </div>

                    {monthlyReport && (
                        <div>
                            <h2 className="chart-title">Monthly Performance</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                <Card title="Total Transactions" value={monthlyReport.total_transactions} bg="#f8fafc" textColor="#475569" prefix="" hasBorder />
                                <Card title="Total Sales" value={monthlyReport.monthly_sales} color="rgba(16, 185, 129, 0.3)" bg="#ffffff" textColor="#059669" hasBorder />
                                <Card title="Total Recovery" value={monthlyReport.monthly_recovery} color="rgba(59, 130, 246, 0.3)" bg="#ffffff" textColor="#2563eb" hasBorder />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PROFIT & EXPENSE CONTENT */}
            {activeTab === 'profit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-form-card">
                        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}> Add Business Expense</h3>
                        <form onSubmit={handleExpenseSubmit}>
                            <div className="form-row" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: 2, minWidth: '200px' }}>
                                    <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Description</label>
                                    <input type="text" placeholder="e.g. Electric Bill" required
                                        value={expense.description} onChange={e => setExpense({ ...expense, description: e.target.value })}
                                        className="form-input-modern"
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Amount</label>
                                    <input type="number" placeholder="Amount" required
                                        value={expense.amount} onChange={e => setExpense({ ...expense, amount: e.target.value })}
                                        className="form-input-modern"
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Category</label>
                                    <select value={expense.category} onChange={e => setExpense({ ...expense, category: e.target.value })} className="form-input-modern">
                                        <option>General</option>
                                        <option>Salary</option>
                                        <option>Maintenance</option>
                                        <option>Rent</option>
                                    </select>
                                </div>
                                <button type="submit" style={{ height: '44px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(220,38,38,0.3)' }}>Add Expense</button>
                            </div>
                        </form>
                    </div>

                    <div className="chart-card">
                        <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: '#f1f5f9', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label className="form-label" style={{ marginBottom: 0, fontWeight: '600' }}>Month: </label>
                            <input type="number" value={month} onChange={e => setMonth(e.target.value)} className="form-input-modern" style={{ width: '80px' }} />
                            <label className="form-label" style={{ marginBottom: 0, fontWeight: '600' }}>Year: </label>
                            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="form-input-modern" style={{ width: '100px' }} />
                            <button onClick={fetchProfit} className="btn-gradient-primary" style={{ marginLeft: '10px' }}>Refresh</button>
                        </div>

                        {profitReport && (
                            <div style={{ textAlign: 'center', padding: '30px' }}>
                                <h2 className="chart-title" style={{ justifyContent: 'center' }}>Net Profit Calculation</h2>
                                <h1 style={{ fontSize: '56px', margin: '30px 0', color: profitReport.status === 'Profit' ? '#059669' : '#dc2626', textShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                    Rs. {profitReport.net_profit}
                                </h1>
                                <div style={{ display: 'inline-flex', gap: '20px', padding: '15px 30px', background: '#f8fafc', borderRadius: '50px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <span style={{ fontSize: '1.1rem', color: '#475569' }}><strong>Sales:</strong> Rs. {profitReport.gross_sales}</span>
                                    <div style={{ width: '1px', background: '#cbd5e1' }}></div>
                                    <span style={{ fontSize: '1.1rem', color: '#475569' }}><strong>Expenses:</strong> Rs. {profitReport.total_expenses}</span>
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
    <div className="impact-card" style={{
        padding: '25px',
        backgroundColor: bg || 'white',
        color: textColor || '#1e293b',
        border: hasBorder || color ? `1px solid ${color || 'transparent'}` : '1px solid #e2e8f0',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px'
    }}>
        <h3 style={{ fontSize: '0.875rem', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: textColor || '#64748b' }}>{title}</h3>
        <span style={{ fontSize: '28px', fontWeight: '800' }}>{prefix}{value || 0}</span>
    </div>
);

export default Reports;
