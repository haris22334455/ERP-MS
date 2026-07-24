import express from 'express';
import { submitRequest, getRequests, approveRequest, rejectRequest } from '../controllers/registrationController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/role';

const router = express.Router();

// Public route for shopkeepers to submit a registration request
router.post('/register-request', submitRequest);

// Admin routes for managing requests
router.get('/register-requests', authenticateToken, requireAdmin, getRequests);
router.put('/register-requests/:id/approve', authenticateToken, requireAdmin, approveRequest);
router.put('/register-requests/:id/reject', authenticateToken, requireAdmin, rejectRequest);

export default router;
