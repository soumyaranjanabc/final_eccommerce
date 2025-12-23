import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from "../services/api";
 // Using your configured axios instance
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                // Fetching order details from backend using the ID from the URL
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("Could not retrieve order details. Please check your connection or Order ID.");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    // Loading State
    if (loading) {
        return (
            <>
                <Header />
                <div className="confirmation-container">
                    <div className="loader">Loading your order details...</div>
                </div>
                <Footer />
            </>
        );
    }

    // Error State
    if (error || !order) {
        return (
            <>
                <Header />
                <div className="confirmation-container">
                    <div className="confirmation-box">
                        <p className="error-message">⚠️ {error || "Order not found."}</p>
                        <Link to="/" className="back-to-home-button">Back to Home</Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="confirmation-container">
                <div className="confirmation-box">
                    <div className="success-icon" style={{ fontSize: '3rem' }}>✅</div>
                    <h2>Order Placed Successfully!</h2>
                    
                    <p className="thank-you-message">
                        Thank you for your purchase! Your order is being processed.
                    </p>
                    
                    <div className="order-details-summary">
                        <p><strong>Order ID:</strong> #{order.id || order.orderId}</p>
                        <p><strong>Date:</strong> {new Date(order.created_at || order.orderDate).toLocaleString()}</p>
                        <p>
                            <strong>Total Amount Paid:</strong>{" "}
                            <span className="total-amount">₹{parseFloat(order.total_amount || order.totalAmount).toFixed(2)}</span>
                        </p>
                    </div>

                    <div className="items-section">
                        <h3>Items in this Order:</h3>
                        <ul className="ordered-items-list">
                            {order.items && order.items.map((item, index) => (
                                <li key={index} className="ordered-item" style={{ listStyle: 'none', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="item-name"><strong>{item.name}</strong></span>
                                        <span className="item-qty">Qty: {item.quantity}</span>
                                        <span className="item-price">₹{parseFloat(item.price).toFixed(2)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="confirmation-footer" style={{ marginTop: '30px' }}>
                        <p className="email-note">
                            A confirmation email has been sent to your registered inbox.
                        </p>
                        <Link to="/" className="back-to-home-button">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderConfirmation;