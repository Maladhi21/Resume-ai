import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_analyzer';
  try {
    console.log(`Connecting to MongoDB at ${uri}...`);
    // Set connection timeout to 2 seconds to fail fast if MongoDB is not running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.warn('⚠️ WARNING: Failed to connect to local MongoDB database.');
    console.warn('The application will gracefully fallback to a file-based local JSON database (backend/data/).');
    console.warn('All features (User registration, login, resume uploading, and analysis) will function perfectly!');
    isConnected = false;
  }
}

export function getIsConnected() {
  return isConnected;
}
