import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../models/dbHelper.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_secure_secret';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if user exists
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.users.create({
      name,
      email,
      password: hashedPassword,
    });

    const userId = newUser._id || newUser.id;

    // Create token
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields.' });
    }

    // Find user
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const userId = user._id || user.id;

    // Create token
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

// Update User Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updates = {};
    if (name) updates.name = name;
    
    if (email && email !== user.email) {
      // Check if email already in use
      const emailExists = await db.users.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
      updates.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password.' });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    const userId = user._id || user.id;
    const updatedUser = await db.users.findByIdAndUpdate(userId, updates);

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: userId,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// Delete Account
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all resumes and analysis results for this user
    const resumes = await db.resumes.find({ userId });
    for (const resume of resumes) {
      if (resume.analysisResult) {
        const analysisId = resume.analysisResult._id || resume.analysisResult.id || resume.analysisResult;
        await db.analysisResults.findByIdAndDelete(analysisId);
      }
      await db.resumes.findByIdAndDelete(resume._id || resume.id);
    }

    // Delete user
    await db.users.findByIdAndDelete(userId);

    res.json({ message: 'Your account and all associated resume data have been permanently deleted.' });
  } catch (error) {
    console.error('Account delete error:', error);
    res.status(500).json({ error: 'Server error deleting account.' });
  }
});

export default router;
