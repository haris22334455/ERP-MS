import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import API_BASE_URL from '../config';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        brand: '',
        item_name: '',
        price: '',
        stock: ''
    });

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        price: '',
        stock: ''
    });

    // Fetch Products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Assuming your backend runs on port 5000, adjust if needed based on typical setup or use relative API path if proxied
            const response = await axios.get(`${API_BASE_URL}/products`, {
                headers: { Authorization: token }
            });
            setProducts(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle Input Changes
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Add Product
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/add-product`, formData, {
                headers: { Authorization: token }
            });
            setFormData({ brand: '', item_name: '', price: '', stock: '' });
            setShowAddForm(false);
            fetchProducts();
            toast('Product added successfully!');
        } catch (err) {
            console.error('Error adding product:', err);
            toast.error('Failed to add product.');
        }
    };

    // Start Editing
    const handleEditClick = (product) => {
        setEditingId(product.id);
        setEditFormData({
            price: product.price,
            stock: product.stock
        });
    };

    // Cancel Editing
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({ price: '', stock: '' });
    };

    // Save Edit
    const handleSaveEdit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/update-product/${id}`, editFormData, {
                headers: { Authorization: token }
            });
            setEditingId(null);
            fetchProducts();
            toast('Product updated successfully!');
        } catch (err) {
            console.error('Error updating product:', err);
            toast.error('Failed to update product.');
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
            fetchProducts();
            toast('Product deleted successfully!');
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete product. It might be linked to existing orders.');
        }
    };

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

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="glass-form-card" style={{marginBottom: '25px'}}>
                    <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                         Add New Product
                    </h3>
                    <form onSubmit={handleAddSubmit} className="dashboard-form" style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                        <div className="form-group" style={{flex: 1, minWidth: '200px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Brand Name</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required className="form-input-modern" />
                        </div>
                        <div className="form-group" style={{flex: 1, minWidth: '200px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Item Name</label>
                            <input type="text" name="item_name" value={formData.item_name} onChange={handleInputChange} required className="form-input-modern" />
                        </div>
                        <div className="form-group" style={{width: '150px'}}>
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Price (Rs)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="form-input-modern" />
                        </div>
                        <div className="form-group" style={{width: '150px'}}>
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
                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div className="dash-table-wrapper">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Brand</th>
                                    <th>Item Name</th>
                                    <th>Price (Rs)</th>
                                    <th>Stock</th>
                                    <th style={{textAlign: 'center'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <tr key={product.id} className={editingId === product.id ? 'editing-row' : ''}>
                                            <td>{product.id}</td>
                                            <td>{product.brandName}</td>
                                            <td className="td-bold">{product.itemName}</td>

                                            {/* Edit Mode Logic for Price */}
                                            <td>
                                                {editingId === product.id ? (
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={editFormData.price}
                                                        onChange={handleEditInputChange}
                                                        className="form-input-modern"
                                                        style={{padding: '6px', width: '100px'}}
                                                    />
                                                ) : (
                                                    `Rs. ${product.price}`
                                                )}
                                            </td>

                                            {/* Edit Mode Logic for Stock */}
                                            <td>
                                                {editingId === product.id ? (
                                                    <input
                                                        type="number"
                                                        name="stock"
                                                        value={editFormData.stock}
                                                        onChange={handleEditInputChange}
                                                        className="form-input-modern"
                                                        style={{padding: '6px', width: '80px'}}
                                                    />
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
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No products found. Add some!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
