// // // client/src/App.jsx
// // import React from 'react';
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// // // Context Providers
// // import { AuthProvider } from './context/AuthContext';
// // import { CartProvider } from './context/CartContext';

// // // Page Components

// // import HomePage from './pages/Homepage';
// // import Register from './pages/Register';
// // import Login from './pages/Login';
// // import AddProduct from './pages/AddProduct';
// // import Cart from './pages/Cart';
// // import OrderConfirmation from './pages/OrderConfirmation';
// // import InventoryManager from './pages/InventoryManager';
// // import CheckoutAddress from "./pages/CheckoutAddress";

// // // External CSS
// // import './App.css'; 

// // const App = () => {
// //     return (
// //         <Router>
// //             <AuthProvider>
// //                 <CartProvider>
// //                     <Routes>
// //                         {/* Public Routes */}
// //                         <Route path="/" element={<HomePage />} />
// //                         <Route path="/register" element={<Register />} />
// //                         <Route path="/login" element={<Login />} />
                        
// //                         {/* E-commerce Flow Routes */}
// //                         <Route path="/cart" element={<Cart />} />
// //                         <Route path="/order-confirmation" element={<OrderConfirmation />} />

// //                         {/* Admin/Owner Routes (Requires Login) */}
// //                         <Route path="/add-product" element={<AddProduct />} />
                        
// //                         {/* Future routes like Inquiries, User Profile, etc. can be added here */}
// //                         <Route path="/add-product" element={<InventoryManager />} /> {/* Use existing path */}
// //                     </Routes>
// //                 </CartProvider>
// //             </AuthProvider>
// //         </Router>
// //     );
// // };

// // export default App;

// // client/src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// // Context Providers
// import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';

// // Page Components
// import HomePage from './pages/Homepage';
// import Register from './pages/Register';
// import Login from './pages/Login';
// import AddProduct from './pages/AddProduct';
// import Cart from './pages/Cart';
// import OrderConfirmation from './pages/OrderConfirmation';
// import InventoryManager from './pages/InventoryManager';
// import CheckoutAddress from './pages/CheckoutAddress';
// import CheckoutPayment from './pages/CheckoutPayment'; // ✅ ADD

// // External CSS
// import './App.css';

// const App = () => {
//     return (
//         <Router>
//             <AuthProvider>
//                 <CartProvider>
//                     <Routes>
//                         {/* Public Routes */}
//                         <Route path="/" element={<HomePage />} />
//                         <Route path="/register" element={<Register />} />
//                         <Route path="/login" element={<Login />} />

//                         {/* Cart & Checkout Flow */}
//                         <Route path="/cart" element={<Cart />} />
//                         <Route path="/checkout/address" element={<CheckoutAddress />} />  {/* ✅ REQUIRED */}
//                         <Route path="/checkout/payment" element={<CheckoutPayment />} /> {/* ✅ NEXT STEP */}
//                         <Route path="/order-confirmation" element={<OrderConfirmation />} />

//                         {/* Admin / Owner Routes */}
//                         <Route path="/add-product" element={<AddProduct />} />
//                         <Route path="/inventory" element={<InventoryManager />} /> {/* ✅ FIXED DUPLICATE */}
//                     </Routes>
//                 </CartProvider>
//             </AuthProvider>
//         </Router>
//     );
// };

// export default App;

// client/src/App.jsx

// client/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages
import HomePage from "./pages/Homepage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import CheckoutAddress from "./pages/CheckoutAddress";
import CheckoutPayment from "./pages/CheckoutPayment";
import OrderConfirmation from "./pages/OrderConfirmation";
import AddProduct from "./pages/AddProduct";
import InventoryManager from "./pages/InventoryManager";

// Global CSS
import "./App.css";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ---------- Public Routes ---------- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* ---------- Cart ---------- */}
            <Route path="/cart" element={<Cart />} />

            {/* ---------- Protected Checkout Flow ---------- */}
            <Route
              path="/checkout/address"
              element={
                <ProtectedRoute>
                  <CheckoutAddress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout/payment"
              element={
                <ProtectedRoute>
                  <CheckoutPayment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order-confirmation"
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />

            {/* ---------- Admin / Owner Routes ---------- */}
            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <InventoryManager />
                </ProtectedRoute>
              }
            />

            {/* ---------- Fallback ---------- */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
