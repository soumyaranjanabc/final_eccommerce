// client/src/pages/CheckoutPayment.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CheckoutPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart(); // ✅ USE CONTEXT
  const state = location.state;

  // Guard: invalid navigation
  if (!state || !state.total || !state.addressId) {
    return (
      <>
        <Header />
        <div className="payment-container">
          <p>Invalid payment session. Please start checkout again.</p>
        </div>
        <Footer />
      </>
    );
  }

  const pay = async () => {
    try {
      // 🚨 Guard: cart must exist
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        alert("Your cart is empty. Please add items again.");
        navigate("/cart");
        return;
      }

      // 1️⃣ CREATE ORDER
      const orderRes = await api.post("/orders", {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: Number(state.total),
        addressId: state.addressId,
      });

      const { orderId } = orderRes.data;

      if (!orderId) {
        throw new Error("Order ID not returned");
      }

      // 2️⃣ CREATE PAYMENT ORDER
      const paymentRes = await api.post("/payment/create", {
        amount: Number(state.total),
        orderId,
      });

      if (!paymentRes.data || !paymentRes.data.id) {
        throw new Error("Invalid payment order");
      }

      // 3️⃣ OPEN RAZORPAY
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: paymentRes.data.amount,
        currency: "INR",
        name: "Aditya Enterprises",
        description: "Construction Material Purchase",
        order_id: paymentRes.data.id,
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            // ✅ Clear cart via context if you have method
            // clearCart();

            navigate("/order-confirmation", {
              state: { orderId, totalAmount: state.total },
            });
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed.");
          }
        },
        theme: { color: "#0a2540" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="payment-container">
        <h2>Checkout Payment</h2>
        <p>Total Payable: ₹{state.total}</p>

        <button className="checkout-button" onClick={pay}>
          Pay Now
        </button>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPayment;
