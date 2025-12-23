// client/src/pages/CheckoutPayment.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const CheckoutPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state) {
    return <p>Invalid payment session</p>;
  }

  const pay = async () => {
    try {
      // 1️⃣ Create order
      const cart = JSON.parse(localStorage.getItem("cart"));

      const orderRes = await api.post("/orders", {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: Number(state.total),
        addressId: state.addressId
      });

      // 2️⃣ Create Razorpay payment order
      const paymentRes = await api.post("/payment/create", {
        amount: state.total,
        orderId: orderRes.data.orderId
      });

      console.log("Payment order:", paymentRes.data);

      // Razorpay popup will be added next
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="payment-container">
      <h2>Checkout Payment</h2>
      <button onClick={pay}>Pay Now</button>
    </div>
  );
};

export default CheckoutPayment;
