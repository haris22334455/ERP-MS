import express from 'express';
import { login, logout, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
