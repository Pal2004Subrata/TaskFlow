import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspace.js';
import taskRoutes from './routes/task.js';
import analyticsRoutes from './routes/analytics.js';
import workflowRoutes from './routes/workflow.js';
import { globalErrorHandler } from './middlewares/error.js';
import AppError from './utils/AppError.js';
import scheduleDeadlineReminders from './jobs/deadlineReminders.js';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Body parser

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/workflows', workflowRoutes);

// Unhandled Routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// DB Connection
const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
mongoose.connect(DB).then(() => {
  console.log('DB connection successful!');
  // Start cron jobs after DB connects
  scheduleDeadlineReminders();
});

import { initSocket } from './socket.js';

const port = process.env.PORT || 5001;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Initialize Socket.io
initSocket(server);

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
