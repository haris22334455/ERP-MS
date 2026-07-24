import express from 'express';
import { getShopLedger, addTransaction } from '../controllers/ledgerController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/role';

const router = express.Router();

router.get('/ledger/shop/:shopId', authenticateToken, getShopLedger);
router.get('/shop-ledger/:shopId', authenticateToken, getShopLedger); // Alias for frontend
router.post('/add-transaction', authenticateToken, requireAdmin, addTransaction);

export default router;
