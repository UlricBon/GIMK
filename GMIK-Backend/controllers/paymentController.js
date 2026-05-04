import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const confirmPayment = async (req, res) => {
  try {
    const { taskId, paymentMethod } = req.body;
    const userId = req.user.userId;

    // Check if user is dropper of this task
    const taskResult = await query('SELECT dropper_id FROM tasks WHERE id = $1', [taskId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (taskResult.rows[0].dropper_id !== userId) {
      return res.status(403).json({ error: 'Only dropper can confirm payment' });
    }

    // Get payment record
    const paymentResult = await query('SELECT * FROM payments WHERE task_id = $1', [taskId]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update payment
    const paymentId = paymentResult.rows[0].id;
    await query(
      'UPDATE payments SET confirmed = true, confirmed_at = CURRENT_TIMESTAMP, payment_method = $1 WHERE id = $2',
      [paymentMethod, paymentId]
    );

    res.json({ message: 'Payment confirmed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT p.*, t.title, u.display_name
       FROM payments p
       JOIN tasks t ON p.task_id = t.id
       JOIN users u ON CASE WHEN p.dropper_id = $1 THEN p.chaser_id ELSE p.dropper_id END = u.id
       WHERE p.dropper_id = $1 OR p.chaser_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ payments: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
