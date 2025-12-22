// server/controllers/authController.js (REVISED to use userModel)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); // <--- NEW IMPORT

const register = async (req, res) => {
    const { name, email, password, address, phone_number } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Use Model function
        const newUser = await userModel.createUser(name, email, password_hash, address, phone_number);

        const token = jwt.sign(
            { id: newUser.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email already exists.' });
        }
        console.error('Registration error:', err.message);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use Model function
        const user = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(400).json({ error: 'Invalid Credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials.' });
        }

        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

module.exports = {
    register,
    login,
};