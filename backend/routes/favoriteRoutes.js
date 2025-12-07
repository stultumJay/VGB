import express from 'express';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} from '../controllers/favoriteController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (registered users only)
router.get('/user/:userId', verifyToken, getUserFavorites);
router.post('/', verifyToken, addFavorite);
router.delete('/:userId/:gameId', verifyToken, removeFavorite);
router.get('/check/:userId/:gameId', verifyToken, checkFavorite);

export default router;