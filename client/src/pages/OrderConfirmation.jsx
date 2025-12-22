// client/src/pages/OrderConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (location.state && location.state.orderId) {
            setOrderData(location.state);
        } else {
            console.error("No order confirmation data found in navigation state.");
        }
    }, [location.state, navigate]);

    if (!orderData) {
        return (
            <>
                <Header />
                <div className="confirmation-container">
                    <p className="error-message">No recent order found.</p>
                </div>
                <Footer />
            </>
        );
    }

    const subtotal = parseFloat(orderData.totalAmount);
    const shipping = 50.00;
    const finalTotal = (subtotal + shipping).toFixed(2);

    return (
        <>
            <Header />
            <div className="confirmation-container">
                <div className="confirmation-box">
                    <h2>✅ Order Placed Successfully!</h2>
                    
                    <p className="thank-you-message">
                        Thank you, <strong>{orderData.userName || 'Customer'}</strong>, for your purchase!
                    </p>
                    
                    <div className="order-details-summary">
                        <p><strong>Order ID:</strong> #{orderData.orderId}</p>
                        <p><strong>Date:</strong> {new Date(orderData.orderDate).toLocaleString()}</p>
                        <p>
                            <strong>Total Charged (Incl. Shipping):</strong>{" "}
                            <span className="total-amount">₹{finalTotal}</span>
                        </p>
                    </div>

                    <h3>Items Ordered:</h3>
                    <ul className="ordered-items-list">
                        {orderData.items.map((item, index) => (
                            <li key={index}>
                                {item.name} — {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
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
