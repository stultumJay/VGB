import { auth, db } from '../config/firebase.js';

// Verify Firebase ID token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    req.userId = decodedToken.uid;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is admin
export const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const snapshot = await db.ref(`users/${userId}`).once('value');
    const userData = snapshot.val();
    
    if (!userData || !userData.administrator) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};