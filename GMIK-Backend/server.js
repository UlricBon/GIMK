import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import routes
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Import socket handlers
import { initializeSocket } from './sockets/socketHandler.js';

// Import database
import { initializeDatabase } from './config/database.js';
import initializeTables from './database/schema.js';

// Initialize environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      process.env.ANDROID_APP_URL || 'http://localhost:8081',
      process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000',
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/ // Allow all local IPs
    ],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins for development
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Initialize Socket.IO
initializeSocket(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    initializeTables();
    console.log('✓ Database initialized');
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 GMIK Backend Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };
