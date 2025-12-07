import express from 'express';
import {
  getAllGames,
  getGameById,
  searchGames,
  filterGames,
  addGame,
  updateGame,
  deleteGame
} from '../controllers/gameController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllGames);
router.get('/search', searchGames);
router.get('/filter', filterGames);
router.get('/:gameId', getGameById);

// Admin routes (NO MULTER - using Base64 now!)
router.post('/', verifyToken, verifyAdmin, addGame);
router.put('/:gameId', verifyToken, verifyAdmin, updateGame);
router.delete('/:gameId', verifyToken, verifyAdmin, deleteGame);

export default router;