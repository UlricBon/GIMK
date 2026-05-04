import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  switchRole 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/switch-role', authenticateToken, switchRole);

export default router;
