import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import DataGrid from '../components/DataGrid';

const OrderBooking = () => {
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);

    // Cart State
    const [selectedShop, setSelectedShop] = useState('');
    const [cart, setCart] = useState([]);
    const [currentProduct, setCurrentProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [qtys, setQtys] = useState({}); // Stores qty for each product in the grid

    const role = localStorage.getItem('role');
    const userShopId = localStorage.getItem('shop_id'); // Assuming shop_id is stored on login for shopkeepers

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const shopsRes = await axios.get(`${API_BASE_URL}/shops`);
                const productsRes = await axios.get(`${API_BASE_URL}/products`);
                setShops(shopsRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                console.error("Error loading data", err);
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
            alert("Please select a product and valid quantity");
            return;
        }

        const productDetails = products.find(p => p.id === parseInt(currentProduct));

        if (productDetails.stock < quantity) {
            alert(`Insufficient Stock! Available: ${productDetails.stock}`);
            return;
        }

        const newItem = {
            product_id: productDetails.id,
            item_name: productDetails.item_name,
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
            alert("Select a shop and add items to cart!");
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
            alert("Order Booked Successfully!");
            setCart([]);
            if (role !== 'shopkeeper') {
                setSelectedShop('');
            }
            // Fetch updated products to reflect new stock locally
            const productsRes = await axios.get(`${API_BASE_URL}/products`);
            setProducts(productsRes.data);
        } catch (err) {
            console.error(err);
            const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Error booking order:\n${errorDetails}`);
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
        if (qty <= 0) return alert("Invalid quantity");
        if (product.stock < qty) return alert(`Insufficient Stock! Available: ${product.stock}`);

        const newItem = {
            product_id: product.id,
            item_name: product.item_name,
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
        alert("Added to Cart!");
    };

    return (
        <div className="animate-fade-in dashboard-container">
            <h1 className="page-title">{role === 'shopkeeper' ? 'Browse Products' : 'Book New Order'}</h1>

            {/* SHOPKEEPER VISUAL VIEW */}
            {role === 'shopkeeper' ? (
                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column-reverse' }}>

                    {/* Product Grid */}
                    <div className="product-grid">
                        {products.map(product => (
                            <div key={product.id} className="card product-card">
                                <div className="product-icon">
                                    <i className="fas fa-box-open" style={{ fontSize: '2rem', color: 'var(--emerald-500)' }}></i>
                                </div>
                                <h4>{product.brand}</h4>
                                <h3>{product.item_name}</h3>
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
                                        className="form-input"
                                        style={{ width: '70px', padding: '8px' }}
                                        disabled={product.stock === 0}
                                    />
                                    <button
                                        className="btn btn-primary full-width"
                                        onClick={() => {
                                            const qty = parseInt(qtys[product.id] ?? 1) || 1;
                                            addToCartDirect(product, qty);
                                            // Reset quantity back to 1 after adding
                                            setQtys({ ...qtys, [product.id]: 1 });
                                        }}
                                        disabled={product.stock === 0}
                                    >
                                        Add to Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating Cart / Summary */}
                    <div className="card dashboard-card">
                        <div className="card-header-flex">
                            <h3>Your Cart ({cart.length} items)</h3>
                            <h3>Total: Rs. {grandTotal}</h3>
                        </div>
                        {cart.length > 0 ? (
                            <>
                                <DataGrid
                                    columns={cartColumns}
                                    data={cart}
                                    actions={cartActions}
                                />
                                <button onClick={submitOrder} className="btn btn-primary full-width" style={{ marginTop: '15px' }}>
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
                <div className="form-row">

                    {/* LEFT PANEL: SELECTION */}
                    <div className="card dashboard-card" style={{ flex: 1 }}>
                        <h3>1. Select Shop</h3>
                        <div className="form-group">
                            <label className="form-label">Shop From List</label>
                            <select
                                value={role === 'shopkeeper' ? userShopId : selectedShop}
                                onChange={(e) => setSelectedShop(e.target.value)}
                                className="form-input"
                                disabled={role === 'shopkeeper'}
                            >
                                <option value="">-- Choose Shop --</option>
                                {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shop_name} ({s.shop_address})</option>)}
                            </select>
                        </div>

                        <h3>2. Add Products</h3>
                        <div className="form-group">
                            <label className="form-label">Select Product</label>
                            <select
                                value={currentProduct}
                                onChange={(e) => setCurrentProduct(e.target.value)}
                                className="form-input"
                            >
                                <option value="">-- Choose Product --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.item_name} - Rs.{p.price} (Stock: {p.stock})</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ width: '100px', marginBottom: 0 }}>
                                <label className="form-label">Quantity</label>
                                <input
                                    type="number" min="1" value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <button
                                onClick={addToCart}
                                className="btn btn-primary"
                                style={{ flex: 1, height: '42px' }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: CART */}
                    <div className="card dashboard-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3>Order Summary</h3>
                        {selectedShop && <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}><strong>Shop:</strong> {shops.find(s => s.shop_id === Number(selectedShop))?.shop_name}</p>}

                        <div style={{ flex: 1, marginBottom: '20px' }}>
                            <DataGrid
                                columns={cartColumns}
                                data={cart}
                                actions={cartActions}
                            />
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'right' }}>
                            <h2 style={{ color: 'var(--primary-900)' }}>Grand Total: Rs. {grandTotal}</h2>
                            <button
                                onClick={submitOrder}
                                disabled={cart.length === 0}
                                className={`btn ${cart.length > 0 ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ width: '100%', padding: '12px' }}
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
