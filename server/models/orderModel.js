// import pool from "../config/db.js";

// /**
//  * Creates a new order record within a transaction.
//  * Amounts are treated as ₹ INR.
//  * Requires a PostgreSQL client object from a transaction.
//  */
// export const createOrder = async (client, userId, totalAmountInr) => {
//   const result = await client.query(
//     `INSERT INTO orders (user_id, total_amount, status)
//      VALUES ($1, $2, $3)
//      RETURNING id, order_date, total_amount`,
//     [userId, totalAmountInr, "Pending"]
//   );

//   return result.rows[0];
// };

// /**
//  * Inserts an order item record within a transaction.
//  * priceAtPurchase is ₹ INR.
//  * Requires a PostgreSQL client object from a transaction.
//  */
// export const createOrderItem = async (
//   client,
//   orderId,
//   productId,
//   quantity,
//   priceAtPurchaseInr
// ) => {
//   await client.query(
//     `INSERT INTO order_items
//      (order_id, product_id, quantity, price_at_purchase)
//      VALUES ($1, $2, $3, $4)`,
//     [orderId, productId, quantity, priceAtPurchaseInr]
//   );
// };

import pool from "../config/db.js";

/**
 * Creates a new order record within a transaction.
 * Amounts are treated as ₹ INR.
 * Requires a PostgreSQL client object from a transaction.
 */
export const createOrder = async (client, userId, totalAmountInr) => {
  const result = await client.query(
    `INSERT INTO orders (user_id, total_amount, status)
     VALUES ($1, $2, $3)
     RETURNING id, order_date, total_amount`,
    [userId, totalAmountInr, "Pending"]
  );

  return result.rows[0];
};

/**
 * Inserts an order item record within a transaction.
 * priceAtPurchase is ₹ INR.
 * Requires a PostgreSQL client object from a transaction.
 */
// server/models/orderModel.js
// server/models/orderModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "PLACED",
    },

    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    payment_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    payment_signature: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

export default Order;
