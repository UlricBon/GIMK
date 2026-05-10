import express from 'express';
import { 
  getMessages, 
  sendMessage,
  getDirectMessages,
  sendDirectMessage
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/task/:taskId', authenticateToken, getMessages);
router.post('/task/:taskId', authenticateToken, sendMessage);
router.get('/direct/:userId', authenticateToken, getDirectMessages);
router.post('/direct/:userId', authenticateToken, sendDirectMessage);

export default router;
