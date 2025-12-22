// client/src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(
        JSON.parse(localStorage.getItem('cartItems')) || []
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth(); 

    // Sync cart to local storage whenever cartItems changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- Core Cart Operations ---

    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const exists = prevItems.find(item => item.id === product.id);

            if (exists) {
                // If product exists, update quantity
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // If new product, add it, ensuring price is numeric
                return [...prevItems, { 
                    ...product, 
                    quantity,
                    price: parseFloat(product.price) // Ensure price is a number
                }];
            }
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems => 
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);
    };
    
    const getItemCount = () => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    };

    // --- Checkout Operation ---

    const checkout = async () => {
        if (!token) {
            setError('You must be logged in to checkout.');
            return false;
        }
        if (cartItems.length === 0) {
            setError('Your cart is empty.');
            return false;
        }

        setLoading(true);
        setError(null);
        
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name // Added for better server logs/error handling
                })),
                totalAmount: getTotal(),
            };
            
            const response = await axios.post('http://localhost:5001/api/orders/checkout', orderData);

            if (response.status === 200) {
                clearCart();
                setLoading(false);
                return response.data; // Confirmation details
            }

        } catch (err) {
            // Use the specific error message from the backend (e.g., stock error)
            setError(err.response?.data?.error || 'Checkout failed due to a server error.');
            setLoading(false);
            return false;
        }
    };

    return (
        <CartContext.Provider 
            value={{ 
                cartItems, 
                loading, 
                error, 
                addToCart, 
                updateQuantity, 
                removeFromCart, 
                clearCart, 
                getTotal,
                getItemCount,
                checkout 
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);