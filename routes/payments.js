import express from 'express';
import {
  createPayment,
  confirmPayment,
  getPaymentHistory,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, createPayment);
router.post('/:paymentId/confirm', authMiddleware, confirmPayment);
router.get('/history', authMiddleware, getPaymentHistory);

export default router;
