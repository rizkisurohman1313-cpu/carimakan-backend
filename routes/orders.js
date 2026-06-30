import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:orderId', authMiddleware, getOrderDetail);
router.put('/:orderId/status', authMiddleware, updateOrderStatus);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);

export default router;
