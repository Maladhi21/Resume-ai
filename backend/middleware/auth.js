import jwt from 'jsonwebtoken';
import { db } from '../models/dbHelper.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Token is empty.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_to_a_secure_secret');
    
    // Find the user
    const user = await db.users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    // Attach user to request object
    req.user = {
      id: user._id || user.id,
      name: user.name,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}
