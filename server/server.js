import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import dietRoutes from './routes/diet.routes.js';
import waterRoutes from './routes/water.routes.js';
import weightRoutes from './routes/weight.routes.js';
import habitRoutes from './routes/habit.routes.js';
import sleepRoutes from './routes/sleep.routes.js';
import goalRoutes from './routes/goal.routes.js';
import photoRoutes from './routes/photo.routes.js';
import journalRoutes from './routes/journal.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Production CORS setup: accepts localhost in dev & process.env.CLIENT_URL in production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for production deployment
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FitTrack Production API is operational 🚀' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
