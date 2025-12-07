import express from 'express';
import {
  getAllReviews,
  getReviewsByGame,
  getReviewsByUser,
  addReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllReviews);
router.get('/game/:gameId', getReviewsByGame);
router.get('/user/:userId', getReviewsByUser);

// Protected routes (registered users)
router.post('/', verifyToken, addReview);
router.put('/:reviewId', verifyToken, updateReview);
router.delete('/:reviewId', verifyToken, deleteReview);

export default router;