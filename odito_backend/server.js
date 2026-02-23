import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

console.log('BOOT CHECK → STRIPE_PRICE_PREMIUM_MONTHLY =', process.env.STRIPE_PRICE_PREMIUM_MONTHLY)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'express-async-errors';
import connectDB from './src/config/database.js';
import routes from './src/routes/index.js';
import Job from './src/modules/jobs/model/Job.js';
import retryScheduler from './src/modules/payments/scheduler/retryScheduler.js';

const startServer = async () => {
  const app = express();
  const server = createServer(app);
  
  // Initialize Socket.IO for real-time progress updates
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Store socket.io instance globally for access in services
  global.io = io;

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Join job-specific rooms for progress updates
    socket.on('join-audit', (jobId) => {
      socket.join(`audit-${jobId}`);
      console.log(`📊 Client ${socket.id} joined audit room for job: ${jobId}`);
    });
    
    socket.on('leave-audit', (jobId) => {
      socket.leave(`audit-${jobId}`);
      console.log(`📊 Client ${socket.id} left audit room for job: ${jobId}`);
    });
    
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  await connectDB();

  /**
   * ABSOLUTE path to storage (inside backend package)
  */
  const storagePath = path.resolve(
    process.cwd(),
    "storage"
  );

  console.log("📂 Serving screenshots from:", storagePath);

  app.use(
    "/storage",
    express.static(storagePath)
  );

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));

  // Raw body parser for Stripe webhooks - MUST be before express.json()
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  app.use(express.json());

  app.use('/api', routes);

  app.get('/debug/jobs', async (req, res) => {
    try {
      const jobs = await Job.find({}).lean();
      res.json({ success: true, data: jobs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get('/', (req, res) => {
    res.json({ message: 'Odito Backend API is running' });
  });

  // Test endpoint for debugging
  app.get('/api/test', (req, res) => {
    console.log('🧪 Test endpoint called');
    res.json({ success: true, message: 'Test endpoint working', timestamp: new Date() });
  });

  app.use((err, req, res, next) => {
    console.error('❌ Error occurred:');
    console.error('  Method:', req.method);
    console.error('  URL:', req.url);
    console.error('  Message:', err.message);
    console.error('  Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`✓ Server is listening on port ${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    console.log(`✓ WebSocket server running for real-time updates`);
    console.log(`✓ Stripe webhook retry scheduler started`);
    
    // Start the retry scheduler
    retryScheduler.start();
  });

  // Add server error handling
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    }
  });

  server.on('clientError', (err, socket) => {
    console.error('❌ Client error:', err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
  });
};

startServer();
