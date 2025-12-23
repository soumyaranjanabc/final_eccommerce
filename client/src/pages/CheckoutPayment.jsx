// client/src/pages/CheckoutPayment.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CheckoutPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  // 🚨 Guard: user directly opened page
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
      // ✅ Safely read cart
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      // 🚨 Guard: cart invalid
      if (!Array.isArray(cart) || cart.length === 0) {
        alert("Your cart is empty. Please add items again.");
        navigate("/cart");
        return;
      }

      // 1️⃣ CREATE ORDER (Backend)
      const orderRes = await api.post("/orders", {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: Number(state.total),
        addressId: state.addressId,
      });

      const { orderId } = orderRes.data;

      if (!orderId) {
        throw new Error("Order ID not returned from server");
      }

      // 2️⃣ CREATE PAYMENT ORDER (Razorpay backend)
      const paymentRes = await api.post("/payment/create", {
        amount: Number(state.total),
        orderId,
      });

      const paymentData = paymentRes.data;

      // 🚨 Guard: Razorpay response
      if (!paymentData || !paymentData.id) {
        throw new Error("Invalid payment order received");
      }

      // 3️⃣ OPEN RAZORPAY CHECKOUT
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY, // frontend Razorpay key
        amount: paymentData.amount,
        currency: "INR",
        name: "Aditya Enterprises",
        description: "Construction Material Purchase",
        order_id: paymentData.id,
        handler: async function (response) {
          try {
            // 4️⃣ VERIFY PAYMENT
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            // ✅ Clear cart after success
            localStorage.removeItem("cart");

            // 5️⃣ GO TO CONFIRMATION
            navigate("/order-confirmation", {
              state: {
                orderId,
                totalAmount: state.total,
              },
            });
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed. Contact support.");
          }
        },
        theme: {
          color: "#0a2540",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
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
