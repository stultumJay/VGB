import express from 'express';
import {
  createUser,
  getUserById,
  updateUser,
  verifyAdmin
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', createUser);

// Protected routes
router.get('/user/:userId', verifyToken, getUserById);
router.put('/user/:userId', verifyToken, updateUser);
router.get('/verify-admin/:userId', verifyToken, verifyAdmin);

export default router;