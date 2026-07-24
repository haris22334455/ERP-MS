import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'UP', message: 'ERP-MS Node.js Backend is running' });
});

// Route imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import shopRoutes from './routes/shopRoutes';
import orderRoutes from './routes/orderRoutes';
import ledgerRoutes from './routes/ledgerRoutes';
import expenseRoutes from './routes/expenseRoutes';
import reportRoutes from './routes/reportRoutes';
import registrationRoutes from './routes/registrationRoutes';

// Use Routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', shopRoutes);
app.use('/', orderRoutes);
app.use('/', ledgerRoutes);
app.use('/', expenseRoutes);
app.use('/', reportRoutes);
app.use('/', registrationRoutes);

// Only listen if run directly (local development)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export for Vercel Serverless
export default app;
