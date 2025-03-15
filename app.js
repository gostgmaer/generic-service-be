require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const authRoute = require("./src/routes/auth");
const pool = require('./src/config/dbConnection'); // Import DB Connection
const userRouter = require('./src/routes/user');

// Import Routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to attach `pool` to requests
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging Middleware
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api', limiter);

// Routes

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'App is running 🚀' });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is running 🚀' });
});


// Global Error Handler
app.use("/api", authRoute);
app.use("/api", userRouter);
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
