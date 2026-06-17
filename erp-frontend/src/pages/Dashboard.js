import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DataGrid from '../components/DataGrid';
import { FaWallet, FaChartLine, FaShoppingCart, FaBoxOpen, FaUsers, FaClipboardList, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [products, setProducts] = useState([]);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [shopsCount, setShopsCount] = useState(0);
    const [graphData, setGraphData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ brand: '', item_name: '', price: '', stock: '', company_name: '' });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            const [reportRes, ledgerRes, productsRes, pendingRes, shopsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/monthly-report?month=${currentMonth}&year=${currentYear}`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/admin/ledger-report?period=weekly`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/products/all`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/pending-orders`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/shops`, { headers: { Authorization: token } })
            ]);

            setReport(reportRes.data);
            setProducts(productsRes.data);
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

    const handleDelete = async (id) => {
        const result = await Swal.fire({title: 'Are you sure?', text: "Are you sure you want to delete this product?", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/delete-product/${id}`);
                fetchData();
            } catch (err) { console.error("Delete error:", err); }
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setFormData({
            brand: product.brandName || product.brand || '',
            item_name: product.itemName || product.item_name || '',
            price: product.price,
            stock: product.stock,
            company_name: product.companyName || product.company_name || ''
        });
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ brand: '', item_name: '', price: '', stock: '', company_name: '' });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            brand: formData.brand,
            item_name: formData.item_name,
            price: Number(formData.price),
            stock: Number(formData.stock),
            company_name: formData.company_name
        };
        try {
            if (editingId) {
                await axios.put(`${API_BASE_URL}/update-product/${editingId}`, dataToSend);
                toast.success("Product Updated Successfully!");
            } else {
                await axios.post(`${API_BASE_URL}/add-product`, dataToSend);
                toast.success("Product Added Successfully!");
            }
            setEditingId(null);
            setFormData({ brand: '', item_name: '', price: '', stock: '', company_name: '' });
            await fetchData();
        } catch (err) {
            console.error("Operation Error:", err);
            toast.error("An error occurred. Check the console.");
        }
    };

    const filteredProducts = products.filter(product => {
        if (searchTerm === "") return true;
        const itemName = product.itemName || product.item_name || '';
        const brandName = product.brandName || product.brand || '';
        return itemName.toLowerCase().includes(searchTerm.toLowerCase()) || brandName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Dashboard...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const productColumns = [
        { header: 'Brand', field: 'brandName', render: (row) => row.brandName || row.brand },
        { header: 'Item Name', field: 'itemName', render: (row) => <strong>{row.itemName || row.item_name}</strong> },
        { header: 'Company', field: 'companyName', render: (row) => row.companyName || row.company_name || 'N/A' },
        { header: 'Price', field: 'price', render: (row) => `Rs. ${row.price}` },
        {
            header: 'Stock Status', field: 'stock', render: (row) => (
                <span className={`status-pill ${row.stock < 10 ? 'status-danger' : 'status-success'}`} style={{padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: row.stock < 10 ? '#fee2e2' : '#dcfce7', color: row.stock < 10 ? '#ef4444' : '#10b981'}}>
                    {row.stock < 10 ? `Low Stock (${row.stock})` : `In Stock (${row.stock})`}
                </span>
            )
        }
    ];

    const productActions = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => handleEditClick(row)} style={{ padding: '6px 12px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
            <button onClick={() => handleDelete(row.id)} style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 className="gradient-title stagger-1">Enterprise Dashboard</h1>

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
                    <div className="quick-action-btn" onClick={() => window.location.href='/order-booking'}>
                        <div className="icon-glow"></div>
                        <FaShoppingCart className="quick-action-icon" />
                        <span>Book New Order</span>
                    </div>
                    <div className="quick-action-btn" onClick={() => window.location.href='/products'}>
                        <div className="icon-glow"></div>
                        <FaBoxOpen className="quick-action-icon" style={{ color: '#8b5cf6' }} />
                        <span>Manage Inventory</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Forms & Table split */}
            <div className="bento-grid">
                <div className="bento-item bento-col-4 stagger-5">
                    <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaPlus style={{color: '#10b981'}}/> {editingId ? "Edit Product" : "Quick Add Product"}
                    </h3>
                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{fontWeight: '700', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', display: 'block'}}>Brand</label>
                            <input className="form-input-modern" type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required placeholder="e.g. Nike" />
                        </div>
                        <div>
                            <label style={{fontWeight: '700', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', display: 'block'}}>Item Name</label>
                            <input className="form-input-modern" type="text" value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} required placeholder="e.g. Air Jordan" />
                        </div>
                        <div>
                            <label style={{fontWeight: '700', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', display: 'block'}}>Company Name</label>
                            <input className="form-input-modern" type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} required placeholder="e.g. MA Traders" />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{fontWeight: '700', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', display: 'block'}}>Price</label>
                                <input className="form-input-modern" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required placeholder="0.00" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{fontWeight: '700', fontSize: '0.85rem', color: '#475569', marginBottom: '5px', display: 'block'}}>Stock</label>
                                <input className="form-input-modern" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required placeholder="0" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" className={editingId ? "btn-gradient-primary" : "btn-gradient-success"} style={{ flex: 1 }}>{editingId ? "Update" : "Add"}</button>
                            {editingId && <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>Cancel</button>}
                        </div>
                    </form>
                </div>

                <div className="bento-item bento-col-4 stagger-5" style={{ padding: '0' }}>
                    <div style={{ padding: '24px 24px 15px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Product Inventory</h3>
                        <input className="search-pill" type="text" placeholder="Search inventory..." onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} style={{ padding: '8px 16px', width: '250px' }} />
                    </div>
                    <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                        <DataGrid columns={productColumns} data={filteredProducts} actions={productActions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
