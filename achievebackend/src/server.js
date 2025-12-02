
/*import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";   
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// serve uploaded files
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes); // NEW
app.use("/api", uploadRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});*/

/*import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'your-frontend-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Database test route
app.get('/api/test-db', async (req, res) => {
  try {
    // You'll need to import pool here or create a separate route
    res.json({ message: 'Database test endpoint - implement connection test' });
  } catch (error) {
    res.status(500).json({ error: 'Database test failed' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});*/


// src/server.js
/*import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection } from './config/db.js';

// Routes
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    database: 'Neon PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;*/

// src/server.js
/*import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection } from './config/db.js';

// Routes
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    database: 'Neon PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Archive System API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      upload: '/api/upload'
    }
  });
});

// Error handling for uncaught routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🔗 Local access: http://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try using a different port:');
    console.log('   - Change PORT in .env file to 3001, 8080, etc.');
    console.log('   - Or kill the process using port 3000');
  } else {
    console.error('❌ Server error:', error);
  }
});

export default app;*/


// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection } from './config/db.js';

// Routes
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Update server.js to include admin routes
import adminRoutes from './routes/adminRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Basic middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: ["http://localhost:5173", "https://improved-memory-xjpqw5rr799fvw5x-5173.app.github.dev"],
  credentials: true
}));

app.use('/api/admin', adminRoutes);

// Simple health check - add this BEFORE any async operations
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test the server FIRST without database
console.log('🚀 Starting server...');

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server successfully started on http://${HOST}:${PORT}`);
  console.log(`🔗 Test with: curl http://localhost:${PORT}/health`);
  
  // Only test database connection AFTER server is running
  setTimeout(() => {
    testConnection().then(success => {
      if (success) {
        console.log('✅ Database connection verified');
      } else {
        console.log('❌ Database connection failed, but server is running');
      }
    });
  }, 1000);
});

// Now add the routes and other middleware AFTER server starts
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Archive System API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      upload: '/api/upload'
    }
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server failed to start:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log('💡 Port 3000 is busy. Try:');
    console.log('   - Using PORT=3001 in .env file');
    console.log('   - Or run: pkill -f node');
  }
});

// Handle process errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
