import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";


export default function CheckoutAddress() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({});

  const submit = async () => {
    const address = await api.post("/addresses", form);

    navigate("/checkout/payment", {
      state: {
        addressId: address.data.id,
        total: state.total
      }
    });
  };

  return (
    <div>
      <h2>Delivery Address</h2>
      <input placeholder="Name" onChange={e=>setForm({...form, full_name:e.target.value})}/>
      <input placeholder="Phone" onChange={e=>setForm({...form, phone:e.target.value})}/>
      <textarea placeholder="Address" onChange={e=>setForm({...form, address_line:e.target.value})}/>
      <input placeholder="City" onChange={e=>setForm({...form, city:e.target.value})}/>
      <input placeholder="State" onChange={e=>setForm({...form, state:e.target.value})}/>
      <input placeholder="Pincode" onChange={e=>setForm({...form, pincode:e.target.value})}/>
      <button onClick={submit}>Continue to Payment</button>
    </div>
  );
}
