import express from 'express';
import { 
  getDailyReport, 
  getMonthlyReport, 
  getLedgerReport, 
  getStaffSales, 
  getDetailedSales, 
  getRecoveryStatus, 
  getNetProfit 
} from '../controllers/reportController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/role';

const router = express.Router();

// Only admin should access reports
router.get('/admin/daily-report', authenticateToken, requireAdmin, getDailyReport);
router.get('/admin/monthly-report', authenticateToken, requireAdmin, getMonthlyReport);
router.get('/admin/ledger-report', authenticateToken, requireAdmin, getLedgerReport);
router.get('/reports/staff-sales', authenticateToken, requireAdmin, getStaffSales);
router.get('/reports/detailed-sales', authenticateToken, requireAdmin, getDetailedSales);
router.get('/reports/recovery-status', authenticateToken, requireAdmin, getRecoveryStatus);
router.get('/reports/net-profit', authenticateToken, requireAdmin, getNetProfit);
router.get('/admin/net-profit', authenticateToken, requireAdmin, getNetProfit); // Alias for frontend

export default router;
