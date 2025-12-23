import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";



export default function CheckoutPayment() {
  const { state } = useLocation();
  const navigate = useNavigate();

const pay = async () => {
  const cart = JSON.parse(localStorage.getItem("cart"));

  const orderRes = await api.post("/orders", {
    items: cart.map(item => ({
      productId: item.id,        // ✅ FIX
      quantity: item.quantity,   // ✅ FIX
      price: item.price          // ✅ FIX
    })),
    totalAmount: Number(state.total),
    addressId: state.addressId
  });

  console.log("Order created:", orderRes.data);

  // Next step: payment create (Razorpay)
};


    const payment = await api.post("/payment/create", {
      amount: state.total,
      orderId: orderRes.data.orderId
    });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: payment.data.amount,
      currency: "INR",
      order_id: payment.data.id,
      handler: async (res) => {
        await api.post("/payment/verify", {
          ...res,
          orderId: orderRes.data.orderId
        });

        navigate(`/order-confirmation/${orderRes.data.orderId}`);
      }
    };

    new window.Razorpay(options).open();
  };

  return <button onClick={pay}>Pay Now</button>;
}
