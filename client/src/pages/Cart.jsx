// client/src/pages/Cart.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer'; 
import CartItem from '../components/CartItem';
import '../App.css'; // CRITICAL: This imports your professional styling

const Cart = () => {
    const { cartItems, getTotal, checkout } = useCart(); 
    const { user } = useAuth();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const navigate = useNavigate();

    // Calculate totals using parseFloat to handle strings from context
    const subtotal = parseFloat(getTotal()) || 0; 
    const shipping = 50.00; // Fixed shipping cost
    const finalTotal = (subtotal + shipping).toFixed(2);

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        setCheckoutError('');

        try {
            // Execute the checkout function to update DB and clear cart
            const result = await checkout(); 

            if (result) {
                // Navigate to confirmation with result data in state
                navigate('/order-confirmation', { state: result }); 
            } else {
                setCheckoutError('Order placed but confirmation data was incomplete.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Checkout failed due to a server error.';
            setCheckoutError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // Render empty cart state
    if (cartItems.length === 0) {
        return (
            <>
                <Header />
                <div className="cart-container">
                    <h2 className="cart-title">Your Shopping Cart</h2>
                    <p className="empty-cart">Your cart is empty. Time to start building!</p>
                </div>
                <Footer /> 
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="cart-container">
                <h2 className="cart-title">Your Shopping Cart ({cartItems.length} items)</h2>
                
                {/* Error Banner for Stock or Auth issues */}
                {checkoutError && <div className="error-message">{checkoutError}</div>}
                
                <div className="cart-content">
                    {/* LEFT COLUMN: List of Items */}
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* RIGHT COLUMN: Summary Card */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="summary-line">
                            <span>Shipping:</span>
                            <span>₹{shipping.toFixed(2)}</span>
                        </div>
                        
                        <hr className="summary-divider" />
                        
                        <div className="summary-line total-line" style={{ fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span className="total-amount">₹{finalTotal}</span>
                        </div>

                        {!user && (
                            <p className="login-prompt">
                                Please log in to complete your order.
                            </p>
                        )}
                        
                        <button 
                            className="checkout-button"
                            onClick={handleCheckout}
                            disabled={isProcessing || !user} 
                        >
                            {isProcessing ? 'Processing...' : `Proceed to Checkout (₹${finalTotal})`}
                        </button>
                    </div>
                </div>
            </div>
            <Footer /> 
        </>
    );
};

export default Cart;