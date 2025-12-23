// client/src/pages/CheckoutPayment.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * Dynamically load Razorpay script
 * This fixes: window.Razorpay is not a constructor
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const CheckoutPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const state = location.state;

  // 🚨 Guard: page opened directly
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

      // 1️⃣ CREATE ORDER (Backend)
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
        throw new Error("Order ID not returned from server");
      }

      // 2️⃣ CREATE PAYMENT ORDER (Backend → Razorpay)
      const paymentRes = await api.post("/payment/create", {
        amount: Number(state.total),
        orderId,
      });

      const paymentData = paymentRes.data;

      if (!paymentData || !paymentData.id) {
        throw new Error("Invalid payment order received");
      }

      // 3️⃣ LOAD RAZORPAY SCRIPT (CRITICAL FIX)
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded || !window.Razorpay) {
        alert("Razorpay SDK failed to load. Please try again.");
        return;
      }

      // 4️⃣ OPEN RAZORPAY CHECKOUT
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY, // frontend key only
        amount: paymentData.amount,
        currency: "INR",
        name: "Aditya Enterprises",
        description: "Construction Material Purchase",
        order_id: paymentData.id,

        handler: async function (response) {
          try {
            // 5️⃣ VERIFY PAYMENT (Backend)
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            // 6️⃣ SUCCESS → CONFIRMATION PAGE
            navigate("/order-confirmation", {
              state: {
                orderId,
                totalAmount: state.total,
              },
            });
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed. Please contact support.");
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
