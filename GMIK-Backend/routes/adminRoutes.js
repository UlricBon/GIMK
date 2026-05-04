import express from 'express';
import { 
  getUsers, 
  disableUser, 
  getActivityLogs, 
  getSystemMetrics,
  moderateContent 
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole(['admin', 'operations_manager']));

router.get('/users', getUsers);
router.put('/users/:userId/disable', disableUser);
router.get('/logs', getActivityLogs);
router.get('/metrics', getSystemMetrics);
router.post('/moderate', moderateContent);

export default router;
