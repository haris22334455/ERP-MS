import express from 'express';
import { 
  bookOrder, 
  getPendingOrders, 
  getOrders, 
  getOrderItems, 
  deliverOrder, 
  cancelOrder, 
  returnOrder 
} from '../controllers/orderController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin, requireStaff } from '../middlewares/role';

const router = express.Router();

router.post('/book-order', authenticateToken, bookOrder);
router.get('/pending-orders', authenticateToken, requireStaff, getPendingOrders);
router.get('/orders', authenticateToken, getOrders);
router.get('/orders/:orderId/items', authenticateToken, getOrderItems);

// Order status updates
router.post('/orders/:orderId/deliver', authenticateToken, requireStaff, deliverOrder);
router.post('/orders/:orderId/cancel', authenticateToken, requireStaff, cancelOrder);
router.post('/orders/:orderId/return', authenticateToken, requireStaff, returnOrder);

// Aliases for frontend (uses PUT + different URL pattern)
router.put('/deliver-order/:orderId', authenticateToken, requireStaff, deliverOrder);
router.put('/cancel-order/:orderId', authenticateToken, requireStaff, cancelOrder);

export default router;
