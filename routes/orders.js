import express from 'express';
import {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { authMiddleware, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/all', authMiddleware, authorizeRole(['admin', 'resto']), getAllOrders);
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:orderId', authMiddleware, getOrderDetail);
router.put('/:orderId/status', authMiddleware, updateOrderStatus);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);

export default router;
