// client/src/pages/InventoryManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryNav from '../components/CategoryNav'; // Can be reused for filtering the list

const API_BASE = 'http://localhost:5001/api/products'; // Base URL
const CATEGORY_API = 'http://localhost:5001/api/categories'; // Category URL

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null); // Holds product object being edited
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { user } = useAuth(); // Assuming owner check is done on backend, but we need user for token

    // 1. Fetch Products and Categories on load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get(API_BASE),
                axios.get(CATEGORY_API)
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setError('');
        } catch (err) {
            setError('Failed to load inventory or categories. Check server status.');
        }
    };

    // Helper to get category name from ID
    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : 'N/A';
    };

    // 2. Start Edit Handler
    const handleEditClick = (product) => {
        setEditingProduct(product);
        // Load existing product data into the form state
        setFormData({
            ...product,
            price: product.price.toString(), // Convert number to string for form input
            stock_quantity: product.stock_quantity.toString(),
            category_id: product.category_id,
        });
        setMessage('');
        setError('');
    };

    // 3. Delete Handler
    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

        try {
            await axios.delete(`${API_BASE}/manage/${productId}`);
            setMessage(`Product "${productName}" deleted successfully.`);
            fetchData(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete product.');
        }
    };

    // 4. Form Change Handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 5. Submit Handler (Add or Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const dataToSend = {
            ...formData,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity),
            category_id: parseInt(formData.category_id),
        };
        
        try {
            let response;
            if (editingProduct) {
                // EDIT (PUT)
                response = await axios.put(`${API_BASE}/manage/${editingProduct.id}`, dataToSend);
            } else {
                // ADD (POST)
                response = await axios.post(`${API_BASE}/manage`, dataToSend);
            }
            
            setMessage(response.data.message);
            setEditingProduct(null); // Close modal
            setFormData({}); // Clear form
            fetchData(); // Refresh list

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product. Check field validity.');
        }
    };

    // 6. Form Modal Component (Simplified for brevity, this would be a separate modal component)
    const ProductFormModal = ({ product, categories, onSubmit, onChange, onClose, formData, error, message }) => (
        <div className="product-modal-backdrop">
            <div className="product-form product-modal">
                <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={onSubmit}>
                    <input type="text" name="name" placeholder="Product Name" value={formData.name || ''} onChange={onChange} required />
                    <textarea name="description" placeholder="Description" value={formData.description || ''} onChange={onChange} required />
                    <input type="number" name="price" placeholder="Price (USD)" value={formData.price || ''} onChange={onChange} step="0.01" required />
                    <input type="number" name="stock_quantity" placeholder="Stock Quantity" value={formData.stock_quantity || ''} onChange={onChange} required />
                    <input type="text" name="image_url" placeholder="Image URL (Optional)" value={formData.image_url || ''} onChange={onChange} />
                    
                    <select name="category_id" value={formData.category_id || ''} onChange={onChange} required>
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.parent_id ? `--- ${cat.name}` : cat.name}
                            </option>
                        ))}
                    </select>
                    
                    <div className="modal-actions">
                        <button type="submit">{product ? 'Save Changes' : 'Add Product'}</button>
                        <button type="button" onClick={onClose} className="secondary-button">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
    
    // Check if user is owner (important safety check, backend enforces)
    const OWNER_ID = 1; // Match your OWNER_USER_ID from .env
    const isOwner = user && user.id === OWNER_ID;
    
    if (!isOwner) {
         return (
             <>
                <Header />
                <div className="homepage-content" style={{textAlign: 'center', marginTop: '50px'}}>
                    <p className="error-message">Access Denied. You must be the site owner to manage inventory.</p>
                </div>
                <Footer />
            </>
         );
    }
    
    return (
        <>
            <Header />
            <div className="homepage-main-layout" style={{ maxWidth: '1400px' }}>
                
                <main className="product-display" style={{ width: '100%' }}>
                    <h1>🏗️ Product Inventory Management</h1>
                    
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}
                    
                    <button 
                        onClick={() => handleEditClick(null)} 
                        className="checkout-button" 
                        style={{ marginBottom: '20px', width: 'auto', padding: '10px 20px' }}
                    >
                        + Add New Product
                    </button>

                    <div className="inventory-table-wrapper"> {/* Style this in App.css */}
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                        </td>
                                        <td>{product.name}</td>
                                        <td>${parseFloat(product.price).toFixed(2)}</td>
                                        <td style={{ color: product.stock_quantity > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {product.stock_quantity}
                                        </td>
                                        <td>{getCategoryName(product.category_id)}</td>
                                        <td>
                                            <button onClick={() => handleEditClick(product)} className="secondary-button">Edit</button>
                                            <button onClick={() => handleDelete(product.id, product.name)} className="remove-button" style={{ marginLeft: '10px' }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
            
            {/* Render Modal */}
            {editingProduct !== undefined && ( // Check if the modal is actively being used for add/edit
                <ProductFormModal 
                    product={editingProduct} 
                    categories={categories}
                    onSubmit={handleSubmit}
                    onChange={handleChange}
                    onClose={() => { setEditingProduct(null); setFormData({}); }}
                    formData={formData}
                    error={error}
                    message={message}
                />
            )}

            <Footer />
        </>
    );
};

export default InventoryManager;