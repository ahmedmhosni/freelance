require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const invoiceRoutes = require('./routes/invoices');
const fileRoutes = require('./routes/files');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const timeTrackingRoutes = require('./routes/timeTracking');
const dashboardRoutes = require('./routes/dashboard');
const quotesRoutes = require('./routes/quotes');
const maintenanceRoutes = require('./routes/maintenance');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check (must be before other routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  app.use(express.static(frontendPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
