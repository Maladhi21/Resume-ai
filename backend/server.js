import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Connect Database
connectDB();

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running successfully',
    time: new Date().toISOString(),
  });
});

// Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});