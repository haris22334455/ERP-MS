import express from 'express';
import { getUsers, createUser, deleteUser, getRegistrationRequests } from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/role';

const router = express.Router();

// Only admin should manage users
router.get('/users', authenticateToken, requireAdmin, getUsers);
router.post('/users', authenticateToken, requireAdmin, createUser);
router.post('/register', authenticateToken, requireAdmin, createUser); // Alias for frontend
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);
router.get('/users/registration-requests', authenticateToken, requireAdmin, getRegistrationRequests);

export default router;
