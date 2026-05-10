import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const sendSupportMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const ticketId = uuidv4();
    await query(
      `INSERT INTO support_tickets (id, user_id, subject, message, status)
       VALUES ($1, $2, $3, $4, 'open')`,
      [ticketId, userId, subject, message]
    );

    res.status(201).json({ 
      message: 'Support ticket created', 
      ticket_id: ticketId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSupportTickets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT * FROM support_tickets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ tickets: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSupportTicketById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { ticketId } = req.params;

    const result = await query(
      `SELECT * FROM support_tickets
       WHERE id = $1 AND user_id = $2`,
      [ticketId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSupportTicket = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { ticketId } = req.params;
    const { status } = req.body;

    // Verify ticket belongs to user
    const ticketResult = await query(
      'SELECT id FROM support_tickets WHERE id = $1 AND user_id = $2',
      [ticketId, userId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const result = await query(
      `UPDATE support_tickets 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, ticketId]
    );

    res.json({ message: 'Ticket updated', ticket: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
