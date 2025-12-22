// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Page Components
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import InventoryManager from './pages/InventoryManager';
// External CSS
import './App.css'; 

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        
                        {/* E-commerce Flow Routes */}
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/order-confirmation" element={<OrderConfirmation />} />

                        {/* Admin/Owner Routes (Requires Login) */}
                        <Route path="/add-product" element={<AddProduct />} />
                        
                        {/* Future routes like Inquiries, User Profile, etc. can be added here */}
                        <Route path="/add-product" element={<InventoryManager />} /> {/* Use existing path */}
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;