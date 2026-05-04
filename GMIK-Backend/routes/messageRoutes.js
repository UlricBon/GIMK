import express from 'express';
import { 
  getMessages, 
  sendMessage 
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/task/:taskId', authenticateToken, getMessages);
router.post('/task/:taskId', authenticateToken, sendMessage);

export default router;
