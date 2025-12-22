// client/src/pages/OrderConfirmation.jsx (FIXED)
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
    // 1. Use useLocation to read state passed during navigation
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);

    // 2. Check and extract data from location.state
    useEffect(() => {
        // location.state is the object passed from the Cart component: { state: result }
        if (location.state && location.state.orderId) {
            setOrderData(location.state);
        } else {
            // If accessed directly or state is missing, redirect to home
            // You can optionally show a generic error message instead of redirecting
            console.error("No order confirmation data found in navigation state.");
            // navigate('/'); 
        }
    }, [location.state, navigate]);

    // Render loading or error state if data is missing
    if (!orderData) {
        return (
             <>
                <Header />
                <div className="confirmation-container">
                    {/* Display the message seen in your screenshot */}
                    <p className="error-message">No recent order found.</p>
                </div>
                <Footer />
            </>
        );
    }

    // Data exists, proceed to display confirmation message
    const subtotal = parseFloat(orderData.totalAmount);
    const shipping = 50.00;
    const finalTotal = (subtotal + shipping).toFixed(2);


    return (
        <>
            <Header />
            <div className="confirmation-container">
                <div className="confirmation-box">
                    <h2>✅ Order Placed Successfully!</h2> {/* SUCCESS MESSAGE RENDERED HERE */}
                    <p className="thank-you-message">
                        Thank you, **{orderData.userName || 'Customer'}**, for your purchase of construction materials!
                    </p>
                    
                    <div className="order-details-summary">
                        <p><strong>Order ID:</strong> #{orderData.orderId}</p>
                        <p><strong>Date:</strong> {new Date(orderData.orderDate).toLocaleString()}</p>
                        <p><strong>Total Charged (Incl. Shipping):</strong> <span className="total-amount">${finalTotal}</span></p>
                    </div>

                    <h3>Items Ordered:</h3>
                    <ul className="ordered-items-list">
                        {orderData.items.map((item, index) => (
                            <li key={index}>
                                {item.name} &mdash; {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                            </li>
                        ))}
                    </ul>

                    <p className="email-note">
                        A detailed order confirmation has been sent to your registered email address.
                    </p>
                    
                    <Link to="/" className="back-to-home-button">
                        Continue Shopping
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderConfirmation;