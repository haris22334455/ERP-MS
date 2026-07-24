import express from 'express';
import { getExpenses, addExpense } from '../controllers/expenseController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/role';

const router = express.Router();

router.get('/expenses', authenticateToken, requireAdmin, getExpenses);
router.post('/add-expense', authenticateToken, requireAdmin, addExpense);

export default router;
