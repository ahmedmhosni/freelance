/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./shared/middleware/errorHandler');

// Import modules
const authModule = require('./modules/auth');
const clientsModule = require('./modules/clients');
const projectsModule = require('./modules/projects');
const tasksModule = require('./modules/tasks');
const invoicesModule = require('./modules/invoices');
const quotesModule = require('./modules/quotes');
const timeTrackingModule = require('./modules/time-tracking');
const reportsModule = require('./modules/reports');
const adminModule = require('./modules/admin');
const announcementsModule = require('./modules/announcements');
const changelogModule = require('./modules/changelog');
const feedbackModule = require('./modules/feedback');
const notificationsModule = require('./modules/notifications');
const statusModule = require('./modules/status');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes - Modular approach
app.use('/api/auth', authModule);
app.use('/api/clients', clientsModule);
app.use('/api/projects', projectsModule);
app.use('/api/tasks', tasksModule);
app.use('/api/invoices', invoicesModule);
app.use('/api/quotes', quotesModule);
app.use('/api/time-tracking', timeTrackingModule);
app.use('/api/reports', reportsModule);
app.use('/api/admin', adminModule);
app.use('/api/announcements', announcementsModule);
app.use('/api/changelog', changelogModule);
app.use('/api/feedback', feedbackModule);
app.use('/api/notifications', notificationsModule);
app.use('/api/status', statusModule);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
