import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites', authMiddleware, addFavorite);
router.delete('/favorites', authMiddleware, removeFavorite);

export default router;
