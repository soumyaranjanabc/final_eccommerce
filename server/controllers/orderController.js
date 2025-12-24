// // // server/controllers/orderController.js

// // import { createRequire } from "module";
// // const require = createRequire(import.meta.url);

// // // CommonJS Sequelize models (matches your setup)
// // const Order = require("../models/orderModel.js");
// // const User = require("../models/userModel.js");

// // import { sendOrderConfirmation } from "../utils/sendOrderConfirmation.js";

// // export const placeOrder = async (req, res) => {
// //   try {
// //     // ===============================
// //     // 1️⃣ AUTH CHECK (VERY IMPORTANT)
// //     // ===============================
// //     if (!req.user || !req.user.id) {
// //       return res.status(401).json({ error: "Unauthorized" });
// //     }

// //     const userId = req.user.id;

// //     // ===============================
// //     // 2️⃣ VALIDATE REQUEST BODY
// //     // ===============================
// //     const { items, addressId, paymentMethod, totalAmount } = req.body;

// //     if (!items || !items.length) {
// //       return res.status(400).json({ error: "No items in order" });
// //     }

// //     if (!addressId || !paymentMethod || !totalAmount) {
// //       return res.status(400).json({ error: "Missing order details" });
// //     }

// //     // ===============================
// //     // 3️⃣ FETCH USER EMAIL
// //     // ===============================
// //     const user = await User.findByPk(userId);
// //     if (!user) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     // ===============================
// //     // 4️⃣ CREATE ORDER (DB)
// //     // ===============================
// //     const order = await Order.create({
// //       user_id: userId,
// //       address_id: addressId,
// //       total_amount: totalAmount,
// //       payment_method: paymentMethod,
// //       status: "PLACED",
// //     });

// //     // ===============================
// //     // 5️⃣ SEND EMAIL (NON-BLOCKING)
// //     // ===============================
// //     try {
// //       await sendOrderConfirmation({
// //         order: {
// //           id: order.id,
// //           total_amount: order.total_amount,
// //           email: user.email,
// //         },
// //         items,
// //         paymentMethod,
// //       });
// //     } catch (emailError) {
// //       console.error(
// //         "📧 Email failed but order placed:",
// //         emailError.message
// //       );
// //       // IMPORTANT: Do NOT throw
// //     }

// //     // ===============================
// //     // 6️⃣ SUCCESS RESPONSE
// //     // ===============================
// //     return res.status(201).json({
// //       message: "Order placed successfully",
// //       orderId: order.id,
// //     });

// //   } catch (error) {
// //     console.error("❌ Order placement failed:", error);
// //     return res.status(500).json({
// //       error: "Order placement failed",
// //     });
// //   }
// // };


// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// // CommonJS Sequelize models (matches your project)
// const Order = require("../models/orderModel.js");
// const User = require("../models/userModel.js");

// // OPTIONAL: comment email out if needed
// import { sendOrderConfirmation } from "../utils/sendOrderConfirmation.js";

// export const placeOrder = async (req, res) => {
//   try {
//     // ===============================
//     // 1️⃣ AUTH CHECK
//     // ===============================
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const userId = req.user.id;

//     // ===============================
//     // 2️⃣ VALIDATE BODY
//     // ===============================
//     const { items, addressId, paymentMethod, totalAmount } = req.body;

//     if (!items || !items.length) {
//       return res.status(400).json({ error: "No items provided" });
//     }

//     if (!addressId || !paymentMethod || !totalAmount) {
//       return res.status(400).json({ error: "Missing order data" });
//     }

//     // ===============================
//     // 3️⃣ FETCH USER
//     // ===============================
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // ===============================
//     // 4️⃣ CREATE ORDER
//     // ===============================
//     const order = await Order.create({
//       user_id: userId,
//       address_id: addressId,
//       total_amount: totalAmount,
//       payment_method: paymentMethod,
//       status: "PLACED",
//     });

//     // ===============================
//     // 5️⃣ EMAIL (NON-BLOCKING)
//     // ===============================
//     try {
//       await sendOrderConfirmation({
//         order: {
//           id: order.id,
//           total_amount: order.total_amount,
//           email: user.email,
//         },
//         items,
//         paymentMethod,
//       });
//     } catch (e) {
//       console.error("📧 Email failed (ignored):", e.message);
//     }

//     // ===============================
//     // 6️⃣ SUCCESS RESPONSE
//     // ===============================
//     return res.status(201).json({
//       message: "Order placed successfully",
//       orderId: order.id,
//     });

//   } catch (error) {
//     console.error("❌ Order placement failed:", error);
//     return res.status(500).json({ error: "Order placement failed" });
//   }
// };

// server/controllers/orderController.js
// server/controllers/orderController.js
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, totalAmount, addressId, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!items || !items.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!addressId) {
      return res.status(400).json({ error: "Address missing" });
    }

    const order = await Order.create({
      user_id: userId,
      total_amount: totalAmount,
      address_id: addressId,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "cod" ? "PENDING" : "INITIATED",
      status: "PLACED",
    });

    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    return res.status(201).json({
      success: true,
      orderId: order.id,
    });
  } catch (err) {
    console.error("🔥 ORDER ERROR:", err);
    return res.status(500).json({
      error: "Order placement failed",
    });
  }
};
