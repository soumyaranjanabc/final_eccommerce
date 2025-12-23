import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Load Razorpay safely */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPayment = () => {
  const { cartItems, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);

  // Guard: prevent direct access
  if (!state || !state.total || !state.addressId) {
    return (
      <>
        <Header />
        <div className="payment-container">
          <p>Invalid checkout session. Please start again.</p>
        </div>
        <Footer />
      </>
    );
  }

  /* COMMON ORDER CREATION */
  const createOrder = async (method) => {
    const res = await api.post("/orders", {
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: Number(state.total), // ✅ RUPEES ONLY
      addressId: state.addressId,
      paymentMethod: method,
    });

    return res.data.orderId;
  };

  /* COD FLOW */
  const handleCOD = async () => {
    const orderId = await createOrder("cod");

    clearCart();
    navigate("/order-confirmation", {
      state: {
        orderId,
        paymentMethod: "cod",
        totalAmount: state.total,
      },
    });
  };

  /* RAZORPAY FLOW */
  const handleRazorpay = async () => {
    const orderId = await createOrder("razorpay");

    const razorpayOrder = await api.post("/payment/create", {
      amount: Number(state.total) * 100, // ✅ PAISE
      orderId,
    });

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Razorpay failed to load");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorpayOrder.data.amount,
      currency: "INR",
      name: "Aditya Enterprises",
      description: "Order Payment",
      order_id: razorpayOrder.data.id,

      handler: async (response) => {
        await api.post("/payment/verify", {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          orderId,
        });

        clearCart();
        navigate("/order-confirmation", {
          state: {
            orderId,
            paymentMethod: "razorpay",
            totalAmount: state.total,
          },
        });
      },

      theme: { color: "#0a2540" },
    };

    new window.Razorpay(options).open();
  };

  const handlePay = async () => {
    if (!cartItems.length) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);
      paymentMethod === "cod" ? await handleCOD() : await handleRazorpay();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="payment-container">
        <h2>Checkout Payment</h2>
        <p>Total Payable: ₹{state.total}</p>

        <div className="payment-methods">
          <label>
            <input
              type="radio"
              checked={paymentMethod === "razorpay"}
              onChange={() => setPaymentMethod("razorpay")}
            />
            Pay Online (Razorpay)
          </label>

          <label>
            <input
              type="radio"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            Cash on Delivery
          </label>
        </div>

        <button
          className="checkout-button"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPayment;
