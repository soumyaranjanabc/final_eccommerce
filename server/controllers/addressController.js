import pool from "../config/db.js";

export const addAddress = async (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, address_line, city, state, pincode } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO addresses
       (user_id, full_name, phone, address_line, city, state, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [userId, full_name, phone, address_line, city, state, pincode]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
