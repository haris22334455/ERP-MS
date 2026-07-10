import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaWallet, FaChartLine, FaShoppingCart, FaBoxOpen, FaUsers, FaClipboardList } from 'react-icons/fa';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [shopsCount, setShopsCount] = useState(0);
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            const [reportRes, ledgerRes, pendingRes, shopsRes, lowStockRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/monthly-report?month=${currentMonth}&year=${currentYear}`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/admin/ledger-report?period=weekly`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/pending-orders`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/shops`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/products/low-stock`, { headers: { Authorization: token } })
            ]);

            setReport(reportRes.data);
            setLowStockProducts(lowStockRes.data);
            setPendingOrdersCount(pendingRes.data.length);
            setShopsCount(shopsRes.data.length);

            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                last7Days.push({ fullDate: `${day}-${month}-${year}`, name: `${day}/${month}`, sales: 0, recovery: 0 });
            }

            ledgerRes.data.forEach(entry => {
                const dayEntry = last7Days.find(d => d.fullDate === entry.formatted_date);
                if (dayEntry) {
                    dayEntry.sales += Number(entry.cash_in || 0);
                    dayEntry.recovery += Number(entry.cash_out || 0);
                }
            });
            setGraphData(last7Days);

        } catch (err) {
            console.error("Data loading error:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Dashboard...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 className="gradient-title stagger-1">Enterprise Dashboard</h1>

            {/* Low Stock Warning Alert Panel */}
            {lowStockProducts.length > 0 && (
                <div className="bento-item bento-col-4 stagger-1" style={{ borderLeft: '6px solid #ef4444', backgroundColor: '#fff5f5', marginBottom: '24px' }}>
                    <h3 style={{ color: '#c53030', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '800' }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span> Low Stock Alert ({lowStockProducts.length} items running low)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                        {lowStockProducts.map(prod => (
                            <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'white', borderRadius: '8px', border: '1px solid #feb2b2', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div>
                                    <strong style={{ color: '#2d3748', fontSize: '0.9rem' }}>{prod.itemName || prod.item_name}</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{prod.brandName || prod.brand}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '0.95rem' }}>Stock: {prod.stock}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#a0aec0' }}>Min: {prod.minimumThreshold !== undefined ? prod.minimumThreshold : 10}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                {/* 1. Monthly Balance Card */}
                <div className="bento-item bento-col-1 stagger-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: '700' }}>Monthly Balance</h3>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>Rs. {report?.monthly_balance !== undefined ? report.monthly_balance : 0}</div>
                        </div>
                        <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '12px', color: '#3B82F6', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)' }}>
                            <FaWallet size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#059669', background: '#D1FAE5', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem' }}>Active</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '500' }}>this month</span>
                    </div>
                </div>

                {/* 2. Total Sales Card */}
                <div className="bento-item bento-col-1 stagger-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: '700' }}>Total Sales</h3>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>Rs. {report?.monthly_sales !== undefined ? report.monthly_sales : 0}</div>
                        </div>
                        <div style={{ background: '#ECFCCB', padding: '12px', borderRadius: '12px', color: '#65A30D', boxShadow: '0 4px 10px rgba(101, 163, 13, 0.2)' }}>
                            <FaChartLine size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#059669', background: '#D1FAE5', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem' }}>Updated</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '500' }}>this month</span>
                    </div>
                </div>

                {/* 3. Pending Orders Card */}
                <div className="bento-item bento-col-1 stagger-3" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: '700' }}>Pending Orders</h3>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>{pendingOrdersCount}</div>
                        </div>
                        <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '12px', color: '#D97706', boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)' }}>
                            <FaClipboardList size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#D97706', background: '#FEF3C7', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem' }}>Queue</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '500' }}>needs delivery</span>
                    </div>
                </div>

                {/* 4. Total Shops Card */}
                <div className="bento-item bento-col-1 stagger-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: '700' }}>Total Shops</h3>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>{shopsCount}</div>
                        </div>
                        <div style={{ background: '#F3E8FF', padding: '12px', borderRadius: '12px', color: '#9333EA', boxShadow: '0 4px 10px rgba(147, 51, 234, 0.2)' }}>
                            <FaUsers size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#9333EA', background: '#F3E8FF', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem' }}>Registered</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '500' }}>in system</span>
                    </div>
                </div>

                {/* Middle Row: Graph (Span 3) and Quick Actions (Span 1) */}
                <div className="bento-item bento-col-3 bento-row-2 stagger-5" style={{ padding: '24px 0 0 0', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginBottom: '20px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaChartLine style={{color: '#3b82f6'}} /> 7 Days Financial Trend
                    </h3>
                    <div style={{ width: '100%', flex: 1, minHeight: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} style={{ border: 'none' }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 12, fontWeight: 500 }} />
                                <YAxis stroke="#64748B" axisLine={false} tickLine={false} dx={-10} tick={{ fontSize: 12, fontWeight: 500 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: '600' }} />
                                <Area name="Sales (Rs)" type="monotone" dataKey="sales" stroke="#10B981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} activeDot={{ r: 8, fill: '#10B981', stroke: 'white', strokeWidth: 4 }} animationDuration={1500} />
                                <Area name="Recovery (Rs)" type="monotone" dataKey="recovery" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRecovery)" strokeWidth={4} activeDot={{ r: 8, fill: '#3b82f6', stroke: 'white', strokeWidth: 4 }} animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-col-1 bento-row-2 stagger-5" style={{ display: 'grid', gridTemplateRows: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div className="quick-action-btn" onClick={() => navigate('/reports')}>
                        <div className="icon-glow"></div>
                        <FaChartLine className="quick-action-icon" style={{ color: '#f59e0b' }} />
                        <span>View Analytics</span>
                    </div>
                    <div className="quick-action-btn" onClick={() => navigate('/products')}>
                        <div className="icon-glow"></div>
                        <FaBoxOpen className="quick-action-icon" style={{ color: '#8b5cf6' }} />
                        <span>Manage Inventory</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
