import express from 'express';
import {
  sendSupportMessage,
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicket
} from '../controllers/supportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/ticket', authenticateToken, sendSupportMessage);
router.get('/tickets', authenticateToken, getSupportTickets);
router.get('/tickets/:ticketId', authenticateToken, getSupportTicketById);
router.put('/tickets/:ticketId', authenticateToken, updateSupportTicket);

export default router;
