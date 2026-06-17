import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import API_BASE_URL from '../config';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const PAGE_SIZE = 15;

const Products = () => {
    // ✅ Read ?search= param from URL (set by header global search)
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const urlSearch = urlParams.get('search') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ✅ PAGINATION state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // ✅ SEARCH state — initialized from URL param if coming from header search
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [searchInput, setSearchInput] = useState(urlSearch);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        brand: '',
        item_name: '',
        price: '',
        stock: '',
        company_name: ''
    });

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        brand: '',
        item_name: '',
        price: '',
        stock: '',
        company_name: ''
    });

    // ✅ PAGINATED Fetch
    const fetchProducts = useCallback(async (page, search) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/products`, {
                headers: { Authorization: token },
                params: { page: page ?? 0, size: PAGE_SIZE, search: search ?? '' }
            });
            // Spring Page response: { content, totalPages, totalElements, number }
            const data = response.data;
            setProducts(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setCurrentPage(data.number || 0);
            setError('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load products.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    // Handle Input Changes
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // ✅ Search handler — resets to page 0
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        setSearchTerm(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setCurrentPage(0);
    };

    // Add Product
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/add-product`, formData, {
                headers: { Authorization: token }
            });
            setFormData({ brand: '', item_name: '', price: '', stock: '', company_name: '' });
            setShowAddForm(false);
            setCurrentPage(0);
            fetchProducts(0, searchTerm);
            toast.success('Product added successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add product.';
            toast.error(msg);
        }
    };

    // Start Editing
    const handleEditClick = (product) => {
        setEditingId(product.id);
        setEditFormData({
            brand: product.brandName || '',
            item_name: product.itemName || '',
            price: product.price,
            stock: product.stock,
            company_name: product.companyName || ''
        });
    };

    // Cancel Editing
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({ brand: '', item_name: '', price: '', stock: '', company_name: '' });
    };

    // Save Edit
    const handleSaveEdit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/update-product/${id}`, editFormData, {
                headers: { Authorization: token }
            });
            setEditingId(null);
            fetchProducts(currentPage, searchTerm);
            toast.success('Product updated successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update product.';
            toast.error(msg);
        }
    };

    // Delete Product
    const handleDelete = async (id) => {
        const result = await Swal.fire({title: 'Are you sure?', text: "Are you sure you want to delete this product? This could fail if there are orders linked to it.", icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }, confirmButtonText: 'Yes, proceed!'});
        if (!result.isConfirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/delete-product/${id}`, {
                headers: { Authorization: token }
            });
            const newPage = products.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage;
            fetchProducts(newPage, searchTerm);
            toast('Product deleted successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete product. It might be linked to existing orders.';
            toast.error(msg);
        }
    };

    if (loading && products.length === 0) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Products...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container" style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                <h1 className="gradient-title" style={{margin: 0}}> Manage Products (Inventory)</h1>
                <button
                    className="btn-gradient-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                    {showAddForm ? <FaTimes /> : <FaPlus />}
                    {showAddForm ? ' Cancel' : ' Add Product'}
                </button>
            </div>

            {/* ✅ SEARCH BAR */}
            <div style={{marginBottom: '20px'}}>
                <form onSubmit={handleSearch} style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <div style={{position: 'relative', flex: 1, maxWidth: '420px'}}>
                        <FaSearch style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none'}} />
                        <input
                            type="text"
                            placeholder="Search by item or brand name..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="form-input-modern"
                            style={{paddingLeft: '40px', paddingRight: searchInput ? '40px' : '16px'}}
                        />
                        {/* Inline X button inside input box */}
                        {searchInput && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                style={{
                                    position: 'absolute', right: '10px', top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: '#e2e8f0', border: 'none', borderRadius: '50%',
                                    width: '22px', height: '22px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#64748b', fontSize: '12px', fontWeight: '700',
                                    transition: 'background 0.2s',
                                    lineHeight: 1
                                }}
                                onMouseEnter={e => e.target.style.background = '#cbd5e1'}
                                onMouseLeave={e => e.target.style.background = '#e2e8f0'}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button type="submit" className="btn-gradient-primary" style={{padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <FaSearch size={13} /> Search
                    </button>
                </form>
                {searchTerm && (
                    <p style={{marginTop: '8px', color: '#64748b', fontSize: '0.875rem'}}>
                        Results for: <strong>"{searchTerm}"</strong> — <span style={{color: '#3b82f6', fontWeight: 600}}>{totalElements}</span> product(s) found
                    </p>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="glass-form-card" style={{marginBottom: '25px'}}>
                    <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                         Add New Product
                    </h3>
                    <form onSubmit={handleAddSubmit} className="dashboard-form" style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                        <div className="form-group" style={{flex: 1, minWidth: '150px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Brand Name</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required className="form-input-modern" />
                        </div>
                        <div className="form-group" style={{flex: 1, minWidth: '150px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Item Name</label>
                            <input type="text" name="item_name" value={formData.item_name} onChange={handleInputChange} required className="form-input-modern" />
                        </div>
                        <div className="form-group" style={{flex: 1, minWidth: '150px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Company Name</label>
                            <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} required className="form-input-modern" placeholder="e.g. MA Traders" />
                        </div>
                        <div className="form-group" style={{width: '120px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Price (Rs)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="form-input-modern" />
                        </div>
                        <div className="form-group" style={{width: '120px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Stock Quantity</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="form-input-modern" />
                        </div>
                        <div style={{width: '100%', marginTop: '10px'}}>
                            <button type="submit" className="btn-gradient-success">Save Product</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="chart-card">
                <div className="dash-table-wrapper">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Brand</th>
                                <th>Item Name</th>
                                <th>Company</th>
                                <th>Price (Rs)</th>
                                <th>Stock</th>
                                <th style={{textAlign: 'center'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{textAlign:'center', padding:'40px'}}>
                                    <div style={{display:'inline-block', width:'32px', height:'32px', border:'4px solid #e2e8f0', borderTop:'4px solid #3b82f6', borderRadius:'50%', animation:'spin 1s linear infinite'}} />
                                </td></tr>
                            ) : products.length > 0 ? (
                                products.map(product => (
                                    <tr key={product.id} className={editingId === product.id ? 'editing-row' : ''}>
                                        <td>{product.id}</td>

                                        {/* Brand */}
                                        <td>
                                            {editingId === product.id ? (
                                                <input type="text" name="brand" value={editFormData.brand} onChange={handleEditInputChange} className="form-input-modern" style={{padding: '6px', width: '120px'}} />
                                            ) : (
                                                product.brandName || product.brand_name || 'N/A'
                                            )}
                                        </td>

                                        {/* Item Name */}
                                        <td>
                                            {editingId === product.id ? (
                                                <input type="text" name="item_name" value={editFormData.item_name} onChange={handleEditInputChange} className="form-input-modern" style={{padding: '6px', width: '140px'}} />
                                            ) : (
                                                product.itemName || product.item_name
                                            )}
                                        </td>

                                        {/* Company */}
                                        <td>
                                            {editingId === product.id ? (
                                                <input type="text" name="company_name" value={editFormData.company_name} onChange={handleEditInputChange} className="form-input-modern" style={{padding: '6px', width: '120px'}} />
                                            ) : (
                                                product.companyName || product.company_name || 'N/A'
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td>
                                            {editingId === product.id ? (
                                                <input type="number" name="price" value={editFormData.price} onChange={handleEditInputChange} className="form-input-modern" style={{padding: '6px', width: '100px'}} />
                                            ) : (
                                                `Rs. ${product.price}`
                                            )}
                                        </td>

                                        {/* Stock */}
                                        <td>
                                            {editingId === product.id ? (
                                                <input type="number" name="stock" value={editFormData.stock} onChange={handleEditInputChange} className="form-input-modern" style={{padding: '6px', width: '80px'}} />
                                            ) : (
                                                <span className={`pill ${product.stock < 10 ? 'pill-danger' : 'pill-success'}`}>
                                                    {product.stock}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className="action-buttons">
                                                {editingId === product.id ? (
                                                    <>
                                                        <button className="btn-icon" style={{background: '#dcfce7', color: '#166534'}} onClick={() => handleSaveEdit(product.id)} title="Save"><FaSave /></button>
                                                        <button className="btn-icon" style={{background: '#f1f5f9', color: '#475569'}} onClick={handleCancelEdit} title="Cancel"><FaTimes /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn-icon btn-edit" onClick={() => handleEditClick(product)} title="Edit"><FaEdit /></button>
                                                        <button className="btn-icon btn-delete" onClick={() => handleDelete(product.id)} title="Delete"><FaTrash /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        {searchTerm ? `No products found for "${searchTerm}".` : 'No products found. Add some!'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✅ PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 20px', borderTop: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px'
                    }}>
                        <span style={{color: '#64748b', fontSize: '0.875rem'}}>
                            Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of <strong>{totalElements}</strong> products
                        </span>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="btn-icon"
                                style={{background: currentPage === 0 ? '#f1f5f9' : '#3b82f6', color: currentPage === 0 ? '#94a3b8' : '#fff', padding: '8px 14px'}}
                                title="Previous Page"
                            >
                                <FaChevronLeft />
                            </button>

                            {Array.from({length: totalPages}, (_, i) => i)
                                .filter(i => Math.abs(i - currentPage) <= 2)
                                .map(i => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                            background: i === currentPage ? '#3b82f6' : '#e2e8f0',
                                            color: i === currentPage ? '#fff' : '#475569',
                                            fontWeight: i === currentPage ? '700' : '400',
                                            minWidth: '36px'
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))
                            }

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="btn-icon"
                                style={{background: currentPage >= totalPages - 1 ? '#f1f5f9' : '#3b82f6', color: currentPage >= totalPages - 1 ? '#94a3b8' : '#fff', padding: '8px 14px'}}
                                title="Next Page"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
