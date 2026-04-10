import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import './Products.css'; // We will create this CSS file next

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
            const response = await axios.get('http://localhost:5000/products', {
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
            await axios.post('http://localhost:5000/add-product', formData, {
                headers: { Authorization: token }
            });
            setFormData({ brand: '', item_name: '', price: '', stock: '' });
            setShowAddForm(false);
            fetchProducts();
            alert('Product added successfully!');
        } catch (err) {
            console.error('Error adding product:', err);
            alert('Failed to add product.');
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
            await axios.put(`http://localhost:5000/update-product/${id}`, editFormData, {
                headers: { Authorization: token }
            });
            setEditingId(null);
            fetchProducts();
            alert('Product updated successfully!');
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Failed to update product.');
        }
    };

    // Delete Product
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product? This could fail if there are orders linked to it.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/delete-product/${id}`, {
                headers: { Authorization: token }
            });
            fetchProducts();
            alert('Product deleted successfully!');
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Failed to delete product. It might be linked to existing orders.');
        }
    };

    return (
        <div className="products-page">
            <div className="page-header">
                <h2>Manage Products (Inventory)</h2>
                <button
                    className="add-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? <FaTimes /> : <FaPlus />}
                    {showAddForm ? ' Cancel' : ' Add Product'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="add-product-form-container card">
                    <h3>Add New Product</h3>
                    <form onSubmit={handleAddSubmit} className="add-product-form">
                        <div className="form-group">
                            <label>Brand Name</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                type="text"
                                name="item_name"
                                value={formData.item_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Price (Rs)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">Save Product</button>
                    </form>
                </div>
            )}

            <div className="card">
                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Brand</th>
                                    <th>Item Name</th>
                                    <th>Price (Rs)</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>{product.brand_name}</td>
                                            <td>{product.item_name}</td>

                                            {/* Edit Mode Logic for Price */}
                                            <td>
                                                {editingId === product.id ? (
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={editFormData.price}
                                                        onChange={handleEditInputChange}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    product.price
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
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span className={product.stock < 10 ? 'low-stock' : ''}>
                                                        {product.stock}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="actions-cell">
                                                {editingId === product.id ? (
                                                    <>
                                                        <button
                                                            className="icon-btn save"
                                                            onClick={() => handleSaveEdit(product.id)}
                                                            title="Save"
                                                        >
                                                            <FaSave />
                                                        </button>
                                                        <button
                                                            className="icon-btn cancel"
                                                            onClick={handleCancelEdit}
                                                            title="Cancel"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="icon-btn edit"
                                                            onClick={() => handleEditClick(product)}
                                                            title="Edit"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            className="icon-btn delete"
                                                            onClick={() => handleDelete(product.id)}
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>No products found. Add some!</td>
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
