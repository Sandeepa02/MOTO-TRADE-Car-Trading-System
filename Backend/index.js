import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import auth from './routes/auth.js';
import vehicles from './routes/vehicles.js';
import spareParts from './routes/spareParts.js';
import modifications from './routes/modifications.js';
import secondHandCars from './routes/secondHandCars.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
// Admin uploads store images as base64 strings — default 100kb JSON limit is too small
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Moto Trade API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/vehicles', vehicles);
app.use('/api/second-hand-cars', secondHandCars);
app.use('/api/spare-parts', spareParts);
app.use('/api/modifications', modifications);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Moto Trade API',
    version: '1.0.0',
    endpoints: {
      vehicles: '/api/vehicles',
      secondHandCars: '/api/second-hand-cars',
      spareParts: '/api/spare-parts',
      modifications: '/api/modifications',
      health: '/api/health'
    }
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
  Moto Trade Backend Server                 
  Running in ${process.env.NODE_ENV} mode   
  Port: ${PORT}                             
  URL: http://localhost:${PORT}             
  Database: MongoDB                         
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
