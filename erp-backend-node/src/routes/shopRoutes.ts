import express from 'express';
import { getShops, addShop, deleteShop, getMarketSummary } from '../controllers/shopController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/role';

const router = express.Router();

router.get('/shops', authenticateToken, getShops);
router.get('/shops/market-summary', authenticateToken, getMarketSummary);
router.post('/shops', authenticateToken, requireAdmin, addShop);
router.post('/add-shop', authenticateToken, requireAdmin, addShop); // Alias for frontend
router.delete('/shops/:id', authenticateToken, requireAdmin, deleteShop);
router.delete('/delete-shop/:id', authenticateToken, requireAdmin, deleteShop); // Alias for frontend

export default router;
