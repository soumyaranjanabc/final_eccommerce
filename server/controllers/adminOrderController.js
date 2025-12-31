import pool from "../config/db.js";

/* GET all orders (owner only) */
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        u.name AS customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* UPDATE order status */
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.id !== 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      "UPDATE orders SET status=$1 WHERE id=$2",
      [status, id]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
