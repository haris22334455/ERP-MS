import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      const reportRes = await axios.get('http://localhost:5000/admin/monthly-report?month=2&year=2026', {
        headers: { Authorization: token }
      });
      setReport(reportRes.data);

      // Products fetch
      const productsRes = await axios.get('http://localhost:5000/products');
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
        await axios.delete(`http://localhost:5000/delete-product/${id}`);
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
        await axios.put(`http://localhost:5000/update-product/${editingId}`, {
            price: dataToSend.price,
            stock: dataToSend.stock
        });
        alert("Product Update Ho Gaya!");
      } else {
        // === ADD NEW LOGIC ===
        await axios.post('http://localhost:5000/add-product', dataToSend);
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

  if (!report) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Loading System...</h2>;

  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>MA Traders - Admin Dashboard</h1>
        <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <strong>Monthly Balance: </strong> 
          <span style={{ color: report.monthly_balance >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
            Rs. {report.monthly_balance}
          </span>
        </div>
      </div>

      {/* FORM SECTION (ADD / EDIT) */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: editingId ? '5px solid #3498db' : '5px solid #2ecc71' }}>
        <h3>{editingId ? "Edit Product Details" : "Add New Product"}</h3>
        
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          <div style={{flex: 1}}>
            <label style={{fontSize: '12px', color: '#666'}}>Brand</label>
            <input 
              type="text" placeholder="Brand" value={formData.brand} 
              onChange={e => setFormData({...formData, brand: e.target.value})} required 
              disabled={editingId} // Edit karte waqt brand change nahi hoga (backend limitation)
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: editingId ? '#eee' : 'white' }}
            />
          </div>
          
          <div style={{flex: 2}}>
            <label style={{fontSize: '12px', color: '#666'}}>Item Name</label>
            <input 
              type="text" placeholder="Item Name" value={formData.item_name} 
              onChange={e => setFormData({...formData, item_name: e.target.value})} required 
              disabled={editingId} // Edit karte waqt name change nahi hoga
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: editingId ? '#eee' : 'white' }}
            />
          </div>

          <div style={{width: '120px'}}>
            <label style={{fontSize: '12px', color: '#666'}}>Price (Rs)</label>
            <input 
              type="number" placeholder="Price" value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div style={{width: '100px'}}>
            <label style={{fontSize: '12px', color: '#666'}}>Stock (Qty)</label>
            <input 
              type="number" placeholder="Stock" value={formData.stock} 
              onChange={e => setFormData({...formData, stock: e.target.value})} required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <button type="submit" style={{ backgroundColor: editingId ? '#3498db' : '#2ecc71', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', height: '40px' }}>
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', height: '40px' }}>
              Cancel
            </button>
          )}

        </form>
        {editingId && <p style={{fontSize: '12px', color: 'orange', marginTop: '5px'}}>Note: Edit mode mein sirf Price aur Stock update honge.</p>}
      </div>

      {/* TABLE SECTION */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Product Inventory</h2>
          <input 
            type="text" 
            placeholder="Search by Name or Brand..." 
            style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#34495e', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Brand</th>
              <th style={{ padding: '12px' }}>Item Name</th>
              <th style={{ padding: '12px' }}>Price</th>
              <th style={{ padding: '12px' }}>Stock</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee', backgroundColor: editingId === p.id ? '#e8f6f3' : 'white' }}>
                  <td style={{ padding: '12px' }}>{p.brand}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.item_name}</td>
                  <td style={{ padding: '12px' }}>Rs. {p.price}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      backgroundColor: p.stock < 10 ? '#e74c3c' : '#2ecc71', 
                      color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' 
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {/* EDIT BUTTON */}
                    <button 
                      onClick={() => handleEditClick(p)}
                      style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    {/* DELETE BUTTON */}
                    <button 
                      onClick={() => handleDelete(p.id)}
                      style={{ backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;