import express from 'express';
import { 
  confirmPayment, 
  getPaymentHistory 
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/confirm', authenticateToken, confirmPayment);
router.get('/history', authenticateToken, getPaymentHistory);

export default router;
