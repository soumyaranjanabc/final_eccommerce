// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import api from "../services/api";



// export default function CheckoutAddress() {
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const [form, setForm] = useState({});

//   const submit = async () => {
//     const address = await api.post("/addresses", form);

//     navigate("/checkout/payment", {
//       state: {
//         addressId: address.data.id,
//         total: state.total
//       }
//     });
//   };

//   return (
//     <div>
//       <h2>Delivery Address</h2>
//       <input placeholder="Name" onChange={e=>setForm({...form, full_name:e.target.value})}/>
//       <input placeholder="Phone" onChange={e=>setForm({...form, phone:e.target.value})}/>
//       <textarea placeholder="Address" onChange={e=>setForm({...form, address_line:e.target.value})}/>
//       <input placeholder="City" onChange={e=>setForm({...form, city:e.target.value})}/>
//       <input placeholder="State" onChange={e=>setForm({...form, state:e.target.value})}/>
//       <input placeholder="Pincode" onChange={e=>setForm({...form, pincode:e.target.value})}/>
//       <button onClick={submit}>Continue to Payment</button>
//     </div>
//   );
// }

// client/src/pages/CheckoutAddress.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  // 🚨 Guard: user should not open this page directly
  if (!state || !state.total) {
    return (
      <>
        <Header />
        <div className="address-container">
          <h3>Invalid checkout session</h3>
          <p>Please go back to cart and try again.</p>
        </div>
        <Footer />
      </>
    );
  }

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    // ✅ Basic validation
    if (
      !form.full_name ||
      !form.phone ||
      !form.address_line ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all address fields");
      return;
    }

    try {
      setLoading(true);

      // ✅ TOKEN IS REQUIRED
      const res = await api.post("/addresses", form);

      // ✅ Move to payment step
      navigate("/checkout/payment", {
        state: {
          addressId: res.data.id,
          total: state.total,
        },
      });
    } catch (err) {
      console.error("Address save failed:", err);
      alert("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="address-container">
        <h2>Delivery Address</h2>

        <input
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) =>
            setForm({ ...form, full_name: e.target.value })
          }
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <textarea
          placeholder="Full Address"
          value={form.address_line}
          onChange={(e) =>
            setForm({ ...form, address_line: e.target.value })
          }
        />

        <input
          placeholder="City"
          value={form.city}
          onChange={(e) =>
            setForm({ ...form, city: e.target.value })
          }
        />

        <input
          placeholder="State"
          value={form.state}
          onChange={(e) =>
            setForm({ ...form, state: e.target.value })
          }
        />

        <input
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) =>
            setForm({ ...form, pincode: e.target.value })
          }
        />

        <button onClick={submit} disabled={loading}>
          {loading ? "Saving..." : "Continue to Payment"}
        </button>
      </div>
      <Footer />
    </>
  );
}
