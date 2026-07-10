import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { getIsConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Simple unique ID generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Read file helper
function readDataFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Write file helper
function writeDataFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Local Database Collection helper
class LocalCollection {
  constructor(filename) {
    this.filename = filename;
  }

  async find(query = {}) {
    const items = readDataFile(this.filename);
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = readDataFile(this.filename);
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const items = readDataFile(this.filename);
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(doc) {
    const items = readDataFile(this.filename);
    const newDoc = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    writeDataFile(this.filename, items);
    return newDoc;
  }

  async findByIdAndDelete(id) {
    const items = readDataFile(this.filename);
    const initialLength = items.length;
    const filteredItems = items.filter(item => item._id !== id && item.id !== id);
    writeDataFile(this.filename, filteredItems);
    return filteredItems.length < initialLength;
  }

  async findByIdAndUpdate(id, update) {
    const items = readDataFile(this.filename);
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...update, updatedAt: new Date().toISOString() };
    writeDataFile(this.filename, items);
    return items[index];
  }
}

// Export the collections
const localUsers = new LocalCollection('users.json');
const localResumes = new LocalCollection('resumes.json');
const localAnalysisResults = new LocalCollection('analysisresults.json');

// Mongoose Models definitions
// We'll define schemas and models so that Mongoose works when MongoDB is connected!
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const analysisResultSchema = new mongoose.Schema({
  overallScore: { type: Number, required: true },
  atsScore: { type: Number, required: true },
  sectionScores: {
    content: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
  },
  skills: { type: [String], default: [] },
  strengths: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFileName: { type: String, required: true },
  filePath: { type: String, required: true },
  extractedText: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
  analysisResult: { type: mongoose.Schema.Types.ObjectId, ref: 'AnalysisResult' },
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const AnalysisResultModel = mongoose.models.AnalysisResult || mongoose.model('AnalysisResult', analysisResultSchema);
export const ResumeModel = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

// Unified DB helper that automatically routes to Mongoose OR Local File DB based on connection status
export const db = {
  users: {
    find: async (query) => {
      if (getIsConnected()) return await UserModel.find(query);
      return await localUsers.find(query);
    },
    findOne: async (query) => {
      if (getIsConnected()) return await UserModel.findOne(query);
      return await localUsers.findOne(query);
    },
    findById: async (id) => {
      if (getIsConnected()) return await UserModel.findById(id);
      return await localUsers.findById(id);
    },
    create: async (data) => {
      if (getIsConnected()) return await UserModel.create(data);
      return await localUsers.create(data);
    },
    findByIdAndUpdate: async (id, data) => {
      if (getIsConnected()) return await UserModel.findByIdAndUpdate(id, data, { new: true });
      return await localUsers.findByIdAndUpdate(id, data);
    },
    findByIdAndDelete: async (id) => {
      if (getIsConnected()) return await UserModel.findByIdAndDelete(id);
      return await localUsers.findByIdAndDelete(id);
    }
  },
  resumes: {
    find: async (query) => {
      if (getIsConnected()) {
        return await ResumeModel.find(query).populate('analysisResult');
      }
      const resumes = await localResumes.find(query);
      // Manually populate
      for (const res of resumes) {
        if (res.analysisResult) {
          res.analysisResult = await localAnalysisResults.findById(res.analysisResult);
        }
      }
      return resumes;
    },
    findOne: async (query) => {
      if (getIsConnected()) {
        return await ResumeModel.findOne(query).populate('analysisResult');
      }
      const resume = await localResumes.findOne(query);
      if (resume && resume.analysisResult) {
        resume.analysisResult = await localAnalysisResults.findById(resume.analysisResult);
      }
      return resume;
    },
    findById: async (id) => {
      if (getIsConnected()) {
        return await ResumeModel.findById(id).populate('analysisResult');
      }
      const resume = await localResumes.findById(id);
      if (resume && resume.analysisResult) {
        resume.analysisResult = await localAnalysisResults.findById(resume.analysisResult);
      }
      return resume;
    },
    create: async (data) => {
      if (getIsConnected()) return await ResumeModel.create(data);
      return await localResumes.create(data);
    },
    findByIdAndUpdate: async (id, data) => {
      if (getIsConnected()) return await ResumeModel.findByIdAndUpdate(id, data, { new: true });
      return await localResumes.findByIdAndUpdate(id, data);
    },
    findByIdAndDelete: async (id) => {
      if (getIsConnected()) return await ResumeModel.findByIdAndDelete(id);
      return await localResumes.findByIdAndDelete(id);
    }
  },
  analysisResults: {
    find: async (query) => {
      if (getIsConnected()) return await AnalysisResultModel.find(query);
      return await localAnalysisResults.find(query);
    },
    findOne: async (query) => {
      if (getIsConnected()) return await AnalysisResultModel.findOne(query);
      return await localAnalysisResults.findOne(query);
    },
    findById: async (id) => {
      if (getIsConnected()) return await AnalysisResultModel.findById(id);
      return await localAnalysisResults.findById(id);
    },
    create: async (data) => {
      if (getIsConnected()) return await AnalysisResultModel.create(data);
      return await localAnalysisResults.create(data);
    },
    findByIdAndUpdate: async (id, data) => {
      if (getIsConnected()) return await AnalysisResultModel.findByIdAndUpdate(id, data, { new: true });
      return await localAnalysisResults.findByIdAndUpdate(id, data);
    },
    findByIdAndDelete: async (id) => {
      if (getIsConnected()) return await AnalysisResultModel.findByIdAndDelete(id);
      return await localAnalysisResults.findByIdAndDelete(id);
    }
  }
};
