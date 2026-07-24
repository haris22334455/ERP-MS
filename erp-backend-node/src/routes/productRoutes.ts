import express from 'express';
import { 
  getProducts, 
  getAllProducts, 
  getLowStockProducts, 
  searchProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin, requireStaff } from '../middlewares/role';

const router = express.Router();

// Staff and Admin can view products
router.get('/products', authenticateToken, getProducts);
router.get('/products/all', authenticateToken, getAllProducts);
router.get('/products/search', authenticateToken, searchProducts);

// Admin only actions
router.get('/products/low-stock', authenticateToken, requireAdmin, getLowStockProducts);
router.post('/add-product', authenticateToken, requireAdmin, addProduct);
router.put('/update-product/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/delete-product/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;
