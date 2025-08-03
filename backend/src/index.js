import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import awsRoutes from './routes/aws.js';
import subscriptionRoutes from './routes/subscription.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Opsless Backend is running! 🚀'
  });
});

// Basic API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Opsless API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      aws: '/api/aws',
      subscription: '/api/subscription'
    }
  });
});

// Mount API routes
app.use('/api/aws', awsRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Subscription routes (basic)
app.get('/api/subscription/plans', (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        id: 1,
        name: "Free Trial",
        description: "3-day access to explore Opsless features",
        price: 0,
        duration_days: 3,
        features: ["Basic features", "1 project", "3 deployments"]
      },
      {
        id: 2,
        name: "One Week",
        description: "Perfect for short-term projects",
        price: 100,
        duration_days: 7,
        features: ["5 projects", "20 deployments", "Priority support"]
      },
      {
        id: 3,
        name: "One Month",
        description: "Ideal for monthly projects",
        price: 180,
        duration_days: 30,
        features: ["10 projects", "50 deployments", "Auto-scaling"]
      }
    ]
  });
});

app.get('/api/subscription/current', (req, res) => {
  res.json({
    success: true,
    subscription: {
      id: 1,
      plan_id: 1,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('message', (data) => {
    console.log('Received message:', data);
    socket.emit('response', { message: 'Message received!' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Opsless Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💳 Subscription API: http://localhost:${PORT}/api/subscription/plans`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 