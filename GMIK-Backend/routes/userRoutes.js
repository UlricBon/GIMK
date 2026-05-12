import express from 'express';
import { 
  getUserById,
  getUserProfile, 
  updateUserProfile,
  deleteUserAccount,
  getUserSettings,
  updateUserSettings,
  switchRole,
  rateUser,
  getUserRatings
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.get('/:id', authenticateToken, getUserById);
router.put('/profile', authenticateToken, updateUserProfile);
router.delete('/profile', authenticateToken, deleteUserAccount);
router.get('/settings', authenticateToken, getUserSettings);
router.put('/settings', authenticateToken, updateUserSettings);
router.post('/switch-role', authenticateToken, switchRole);

// User ratings
router.post('/:id/rate', authenticateToken, rateUser);
router.get('/:id/ratings', authenticateToken, getUserRatings);

export default router;
