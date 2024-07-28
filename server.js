const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const employeeRoutes = require('./app/routes/employeeRoutes');

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));

// Routes
// api for authentication
app.use('/api/auth', require('./app/routes/authRoutes'));
// api for Reset password
app.use('/api/password', require('./app/routes/passwordRoutes'));
// api for employee info
app.use('/api', employeeRoutes);

app.use('/uploads', express.static('uploads'));

// Home route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

// Fallback route
app.get('*', (req, res) => res.redirect('/'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
