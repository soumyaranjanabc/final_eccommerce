import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });

  const submit = async () => {
    try {
      const address = await api.post("/addresses", form);

      navigate("/checkout/payment", {
        state: {
          addressId: address.data.id,
          total: state.total,
        },
      });
    } catch (err) {
      alert("Failed to save address");
    }
  };

  return (
    <>
      <Header />

      <div className="page-container">
        <div className="checkout-card">
          <h2>Delivery Address</h2>
          <p>Enter your delivery details carefully</p>

          <div className="form-grid">
            <input
              placeholder="Full Name"
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />
            <input
              placeholder="Phone Number"
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
            <textarea
              placeholder="Complete Address"
              onChange={(e) =>
                setForm({ ...form, address_line: e.target.value })
              }
            />
            <input
              placeholder="City"
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            />
            <input
              placeholder="State"
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
            />
            <input
              placeholder="Pincode"
              onChange={(e) =>
                setForm({ ...form, pincode: e.target.value })
              }
            />
          </div>

          <button className="checkout-button" onClick={submit}>
            Continue to Payment
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
