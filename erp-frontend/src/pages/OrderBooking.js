import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';
import { FaBoxOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Decode role from JWT token
const decodeJwtRole = (token) => {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded.role || null;
    } catch {
        return null;
    }
};

const OrderBooking = () => {
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cart State
    const [selectedShop, setSelectedShop] = useState('');
    const [cart, setCart] = useState([]);
    const [currentProduct, setCurrentProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [qtys, setQtys] = useState({}); // Stores qty for each product in the grid

    const role = decodeJwtRole(localStorage.getItem('token'));
    const userShopId = localStorage.getItem('shop_id');

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [shopsRes, productsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/shops`, { headers: { Authorization: token } }),
                    axios.get(`${API_BASE_URL}/products/all`, { headers: { Authorization: token } })
                ]);
                setShops(shopsRes.data);
                setProducts(productsRes.data); // /products/all returns plain array
            } catch (err) {
                console.error("Error loading data", err);
                toast.error("Failed to load booking page data");
            } finally {
                setLoading(false);
            }
        };
        loadData();

        if (role === 'shopkeeper' && userShopId) {
            setSelectedShop(userShopId);
        }
    }, [role, userShopId]);

    // Add to Cart Logic
    const addToCart = () => {
        if (!currentProduct || quantity <= 0) {
            toast("Please select a product and valid quantity");
            return;
        }

        const productDetails = products.find(p => p.id === parseInt(currentProduct));

        if (productDetails.stock < quantity) {
            toast.error(`Insufficient Stock! Available: ${productDetails.stock}`);
            return;
        }

        const newItem = {
            product_id: productDetails.id,
            item_name: productDetails.itemName || productDetails.item_name,
            price: productDetails.price,
            quantity: parseInt(quantity),
            total: productDetails.price * parseInt(quantity)
        };

        // Check if item already exists in cart to update qty
        const existingIndex = cart.findIndex(item => item.product_id === productDetails.id);
        if (existingIndex > -1) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += parseInt(quantity);
            newCart[existingIndex].total += newItem.total;
            setCart(newCart);
        } else {
            setCart([...cart, newItem]);
        }

        setQuantity(1);
        setCurrentProduct('');
    };

    // Remove from Cart
    const removeFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
    };

    // Submit Order
    const submitOrder = async () => {
        if (!selectedShop || cart.length === 0) {
            toast("Select a shop and add items to cart!");
            return;
        }

        const userId = localStorage.getItem('user_id');
        const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

        const payload = {
            shop_id: selectedShop,
            user_id: userId, // Current logged in staff
            items: cart,
            total_amount: totalAmount
        };

        try {
            await axios.post(`${API_BASE_URL}/book-order`, payload);
            toast.success("Order Booked Successfully!");
            setCart([]);
            if (role !== 'shopkeeper') {
                setSelectedShop('');
            }
            // Fetch updated products to reflect new stock locally
            const token = localStorage.getItem('token');
            const productsRes = await axios.get(`${API_BASE_URL}/products/all`, { headers: { Authorization: token } });
            setProducts(productsRes.data);
        } catch (err) {
            console.error(err);
            const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            toast.error(`Error booking order:\n${errorDetails}`);
        }
    };

    const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

    // DataGrid Config for Cart
    const cartColumns = [
        { header: 'Product', field: 'item_name' },
        { header: 'Price', field: 'price', render: row => `Rs. ${row.price}` },
        { header: 'Qty', field: 'quantity' },
        { header: 'Total', field: 'total', render: row => `Rs. ${row.total}` }
    ];

    const cartActions = (row) => (
        <button onClick={() => removeFromCart(cart.indexOf(row))} style={{ color: 'var(--danger-text)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
    );


    // --- Shopkeeper Visual Catalog Logic ---
    const addToCartDirect = (product, qty = 1) => {
        if (qty <= 0) return toast.error("Invalid quantity");
        if (product.stock < qty) return toast.error(`Insufficient Stock! Available: ${product.stock}`);

        const newItem = {
            product_id: product.id,
            item_name: product.itemName || product.item_name,
            price: product.price,
            quantity: parseInt(qty),
            total: product.price * parseInt(qty)
        };

        // Check if exists
        const existingIndex = cart.findIndex(item => item.product_id === product.id);
        if (existingIndex > -1) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += parseInt(qty);
            newCart[existingIndex].total += newItem.total;
            setCart(newCart);
        } else {
            setCart([...cart, newItem]);
        }
        toast.success("Added to Cart!");
    };

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px'}}>
            <div style={{width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <h2 className="gradient-title">Loading Order Booking...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-container page-content" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <h1 className="gradient-title"> {role === 'shopkeeper' ? 'Browse Products' : 'Book New Order'}</h1>

            {/* SHOPKEEPER VISUAL VIEW */}
            {role === 'shopkeeper' ? (
                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column-reverse' }}>

                    {/* Product Grid */}
                    <div className="product-grid">
                        {products.map(product => (
                            <div key={product.id} className="card product-card">
                                <div className="product-icon">
                                    <FaBoxOpen style={{ fontSize: '2rem', color: 'var(--emerald-500)' }} />
                                </div>
                                <h4>{product.brandName || product.brand}</h4>
                                <h3>{product.itemName || product.item_name}</h3>
                                <div className="price-tag">Rs. {product.price}</div>
                                <div className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                                    {product.stock} in stock
                                </div>
                                <div className="card-actions" style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={qtys[product.id] ?? 1}
                                        onChange={(e) => setQtys({ ...qtys, [product.id]: e.target.value })}
                                        className="form-input-modern"
                                        style={{ width: '70px', padding: '8px' }}
                                        disabled={product.stock === 0}
                                    />
                                    <button
                                        className="btn-gradient-primary full-width"
                                        onClick={() => {
                                            const qty = parseInt(qtys[product.id] ?? 1) || 1;
                                            addToCartDirect(product, qty);
                                            // Reset quantity back to 1 after adding
                                            setQtys({ ...qtys, [product.id]: 1 });
                                        }}
                                        disabled={product.stock === 0}
                                        style={{ opacity: product.stock === 0 ? 0.5 : 1 }}
                                    >
                                        Add to Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating Cart / Summary */}
                    <div className="glass-form-card">
                        <div className="card-header-flex" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>️ Your Cart ({cart.length} items)</h3>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>Total: Rs. {grandTotal}</h3>
                        </div>
                        {cart.length > 0 ? (
                            <>
                                <div className="dash-table-wrapper">
                                    <DataGrid
                                        columns={cartColumns}
                                        data={cart}
                                        actions={cartActions}
                                    />
                                </div>
                                <button onClick={submitOrder} className="btn-gradient-success full-width" style={{ marginTop: '15px' }}>
                                     Place Order
                                </button>
                            </>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Your cart is empty. Start adding products!</p>
                        )}
                    </div>
                </div>
            ) : (
                /* STAFF / ADMIN TRADITIONAL VIEW */
                <div className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* LEFT PANEL: SELECTION */}
                    <div className="glass-form-card" style={{ flex: 1 }}>
                        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>1. Select Shop</h3>
                        <div className="form-group">
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Shop From List</label>
                            <select
                                value={role === 'shopkeeper' ? userShopId : selectedShop}
                                onChange={(e) => setSelectedShop(e.target.value)}
                                className="form-input-modern"
                                disabled={role === 'shopkeeper'}
                            >
                                <option value="">-- Choose Shop --</option>
                                {shops.map(s => {
                                    const sId = s.shopId || s.shop_id;
                                    const sName = s.shopName || s.shop_name;
                                    const sAddress = s.shopAddress || s.shop_address;
                                    return <option key={sId} value={sId}>{sName} ({sAddress})</option>;
                                })}
                            </select>
                        </div>

                        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px', marginTop: '25px' }}>2. Add Products</h3>
                        <div className="form-group">
                            <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Select Product</label>
                            <select
                                value={currentProduct}
                                onChange={(e) => setCurrentProduct(e.target.value)}
                                className="form-input-modern"
                            >
                                <option value="">-- Choose Product --</option>
                                {products.map(p => {
                                    const pName = p.itemName || p.item_name;
                                    return <option key={p.id} value={p.id}>{pName} - Rs.{p.price} (Stock: {p.stock})</option>;
                                })}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '20px' }}>
                            <div className="form-group" style={{ width: '120px', marginBottom: 0 }}>
                                <label className="form-label" style={{fontWeight: '600', color: '#64748b'}}>Quantity</label>
                                <input
                                    type="number" min="1" value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="form-input-modern"
                                />
                            </div>
                            <button
                                onClick={addToCart}
                                className="btn-gradient-primary"
                                style={{ flex: 1, height: '44px', borderRadius: '10px' }}
                            >
                                 Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: CART */}
                    <div className="glass-form-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>️ Order Summary</h3>
                        {selectedShop && <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}><strong>Shop:</strong> {shops.find(s => (s.shopId || s.shop_id) === Number(selectedShop))?.shopName || shops.find(s => (s.shopId || s.shop_id) === Number(selectedShop))?.shop_name}</p>}

                        <div style={{ flex: 1, marginBottom: '20px' }} className="dash-table-wrapper">
                            <DataGrid
                                columns={cartColumns}
                                data={cart}
                                actions={cartActions}
                            />
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'right' }}>
                            <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>Grand Total: <span style={{ color: '#3b82f6' }}>Rs. {grandTotal}</span></h2>
                            <button
                                onClick={submitOrder}
                                disabled={cart.length === 0}
                                className={cart.length > 0 ? 'btn-gradient-success' : 'btn-gradient-primary'}
                                style={{ width: '100%', padding: '12px', fontSize: '1.1rem', opacity: cart.length === 0 ? 0.5 : 1, background: cart.length === 0 ? '#94a3b8' : undefined }}
                            >
                                 Confirm Order
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default OrderBooking;
