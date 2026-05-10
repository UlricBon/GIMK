import express from 'express';
import { 
  confirmPayment, 
  getPaymentHistory,
  getPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  removePaymentMethod
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/confirm', authenticateToken, confirmPayment);
router.get('/history', authenticateToken, getPaymentHistory);
router.get('/methods', authenticateToken, getPaymentMethods);
router.post('/methods', authenticateToken, addPaymentMethod);
router.post('/methods/:method_id/default', authenticateToken, setDefaultPaymentMethod);
router.delete('/methods/:method_id', authenticateToken, removePaymentMethod);

export default router;
