const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize app
const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ limit: '50mb', extended: false }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something broke!', details: err.message });
});

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/chat', require('./routes/medichat'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api', require('./routes/extractreport'));

// Serve static files
app.use('/reports', express.static(path.join(__dirname, 'reports')));
app.use('/summaries', express.static(path.join(__dirname, 'summaries')));

// Test Route
app.get('/', (req, res) => res.send('API Running'));

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
});