// server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
const corsOptions = {
    // Assuming frontend is on 5173
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions)); 
app.use(bodyParser.json()); 

// --- Database Connection ---
require('./config/db');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes'); // <--- NEW IMPORT

// --- Root Route ---
app.get('/', (req, res) => {
    res.send('Construction E-commerce API is running!');
});

// --- API Route Mounting ---

// 1. Authentication routes
app.use('/api/auth', authRoutes);

// 2. Product routes
app.use('/api/products', productRoutes); 

// 3. Category routes <--- NEW ROUTE USE
app.use('/api/categories', categoryRoutes); 

// 4. Cart and Order routes
app.use('/api/orders', cartRoutes); 

// --- Server Startup ---
app.listen(PORT, () => {
    // Note: Logging the PORT value from the .env file
    console.log(`Server is running on port ${PORT}`); 
});