import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  switchRole 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.get('/settings', authenticateToken, getUserSettings);
router.put('/settings', authenticateToken, updateUserSettings);
router.post('/switch-role', authenticateToken, switchRole);

export default router;
