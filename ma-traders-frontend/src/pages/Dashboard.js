import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataGrid from '../components/DataGrid';

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [products, setProducts] = useState([]);

    // Form ka data handle karne ke liye state
    const [formData, setFormData] = useState({ brand: '', item_name: '', price: '', stock: '' });

    // Search ke liye state
    const [searchTerm, setSearchTerm] = useState('');

    // EDITING STATE: Ye batayega ke hum naya add kar rahe hain ya purana edit kar rahe hain
    const [editingId, setEditingId] = useState(null);

    // 1. Data load karne ka function
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Report fetch
            const reportRes = await axios.get(`${API_BASE_URL}/admin/monthly-report?month=2&year=2026`, {
                headers: { Authorization: token }
            });
            setReport(reportRes.data);

            // Products fetch
            const productsRes = await axios.get(`${API_BASE_URL}/products`);
            setProducts(productsRes.data);

        } catch (err) {
            console.error("Data loading error:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Delete Handle
    const handleDelete = async (id) => {
        if (window.confirm("Kya aap waqai is product ko mitaana chahte hain?")) {
            try {
                await axios.delete(`${API_BASE_URL}/delete-product/${id}`);
                fetchData();
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    // 3. EDIT CLICK HANDLE (Jab Edit button dabaya jaye)
    const handleEditClick = (product) => {
        setEditingId(product.id); // Product ki ID save karein
        setFormData({
            brand: product.brand,
            item_name: product.item_name,
            price: product.price,
            stock: product.stock
        });
        // User ko upar form ki taraf le jayen
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 4. CANCEL EDIT (Agar edit ka irada badal jaye)
    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ brand: '', item_name: '', price: '', stock: '' });
    };

    // 5. FORM SUBMIT (Add aur Update dono yehi handle karega)
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Data tayyar karein
        const dataToSend = {
            brand: formData.brand,
            item_name: formData.item_name,
            price: Number(formData.price),
            stock: Number(formData.stock)
        };

        try {
            if (editingId) {
                // === UPDATE LOGIC ===
                // Backend sirf Price aur Stock update kar raha hai route mein
                await axios.put(`${API_BASE_URL}/update-product/${editingId}`, {
                    price: dataToSend.price,
                    stock: dataToSend.stock
                });
                alert("Product Update Ho Gaya!");
            } else {
                // === ADD NEW LOGIC ===
                await axios.post(`${API_BASE_URL}/add-product`, dataToSend);
                alert("Naya Product Add Ho Gaya!");
            }

            // Reset Form & Refresh List
            setEditingId(null);
            setFormData({ brand: '', item_name: '', price: '', stock: '' });
            await fetchData();

        } catch (err) {
            console.error("Operation Error:", err);
            alert("Error aa gaya. Console check karein.");
        }
    };

    // --- Search Filter Logic ---
    const filteredProducts = products.filter(product => {
        if (searchTerm === "") return true;
        return (
            product.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (!report) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading System...</h2>;

    // Dummy data for graph (In real app, fetch from API)
    const graphData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    // --- Impact Cards Component (Internal) ---
    const ImpactCard = ({ title, value, change, icon, trend }) => (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
            <div>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '5px' }}>{title}</h3>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary-900)' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                        color: trend === 'up' ? 'var(--emerald-600)' : 'var(--danger-text)',
                        background: trend === 'up' ? 'var(--emerald-100)' : 'var(--danger-bg)',
                        padding: '2px 6px', borderRadius: '4px', fontWeight: '600'
                    }}>
                        {change}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>from last month</span>
                </div>
            </div>
            <div style={{ background: '#F1F5F9', padding: '15px', borderRadius: '50%', color: 'var(--primary-Color)' }}>
                {icon}
            </div>
        </div>
    );

    // Columns definition for DataGrid
    const productColumns = [
        { header: 'Brand', field: 'brand' },
        { header: 'Item Name', field: 'item_name', render: (row) => <strong>{row.item_name}</strong> },
        { header: 'Price', field: 'price', render: (row) => `Rs. ${row.price}` },
        {
            header: 'Stock Status', field: 'stock', render: (row) => (
                <span className={`status-pill ${row.stock < 10 ? 'status-danger' : 'status-success'}`}>
                    {row.stock < 10 ? `Low Stock (${row.stock})` : `In Stock (${row.stock})`}
                </span>
            )
        }
    ];

    const productActions = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => handleEditClick(row)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Edit</button>
            <button onClick={() => handleDelete(row.id)} className="btn btn-danger" style={{ padding: '6px 12px' }}>Delete</button>
        </div>
    );



    return (
        <div className="animate-fade-in dashboard-container">
            {/* Page Title */}
            <h1 className="page-title">Dashboard Overview</h1>

            {/* IMPACT CARDS ROW */}
            <div className="dashboard-stats-grid">
                <ImpactCard title="Monthly Balance" value={`Rs. ${report.monthly_balance}`} change="+12%" trend="up" icon={<i className="fas fa-wallet"></i>} />
                <ImpactCard title="Total Sales" value="Rs. 45,000" change="+8.5%" trend="up" />
                <ImpactCard title="Pending Orders" value="15" change="-2%" trend="down" />
                <ImpactCard title="Total Customers" value="1,240" change="+5%" trend="up" />
            </div>

            <div className="dashboard-analytics-grid">
                {/* ANALYTICS GRAPH */}
                <div className="card dashboard-card">
                    <h3>Weekly Sales Trend</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748B" axisLine={false} tickLine={false} dx={-10} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                                />
                                <Line type="natural" dataKey="sales" stroke="#10B981" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#10B981', stroke: 'white', strokeWidth: 4 }} animationDuration={1500} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ADD PRODUCT FORM */}
                <div className="card dashboard-card">
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                        {editingId ? "Edit Product" : "Quick Add Product"}
                    </h3>
                    <form onSubmit={handleFormSubmit} className="dashboard-form">
                        <div className="form-group">
                            <label className="form-label">Brand</label>
                            <input className="form-input" type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required disabled={editingId} placeholder="e.g. Nike" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Item Name</label>
                            <input className="form-input" type="text" value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} required disabled={editingId} placeholder="e.g. Air Jordan" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input className="form-input" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required placeholder="0.00" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock</label>
                                <input className="form-input" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required placeholder="0" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary full-width">{editingId ? "Update Product" : "Add Product"}</button>
                            {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary full-width">Cancel</button>}
                        </div>
                    </form>
                </div>
            </div>

            {/* DATA GRID SECTION */}
            <div className="card dashboard-card">
                <div className="card-header-flex">
                    <h3>Product Inventory</h3>
                    <div className="search-bar-small">
                        <input type="text" placeholder="Search inventory..." onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
                    </div>
                </div>

                <div className="table-responsive">
                    <DataGrid
                        columns={productColumns}
                        data={filteredProducts}
                        actions={productActions}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
