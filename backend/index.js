const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Initialize app
const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/users', require('./routes/users'));

// Test Route
app.get('/', (req, res) => res.send('API Running'));

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));