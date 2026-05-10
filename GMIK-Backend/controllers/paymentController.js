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

    // Get payment methods for this user
    const result = await query(
      `SELECT id, card_holder_name, last_four_digits, expiry_date, type, is_default, created_at
       FROM payment_methods
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json({ methods: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT id, card_holder_name, last_four_digits, expiry_date, type, is_default
       FROM payment_methods
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json({ methods: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { card_holder_name, card_number, expiry_date } = req.body;

    if (!card_holder_name || !card_number || !expiry_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const methodId = uuidv4();
    const lastFour = card_number.slice(-4);
    const maskedNumber = '*'.repeat(card_number.length - 4) + lastFour;

    await query(
      `INSERT INTO payment_methods (id, user_id, card_holder_name, card_number_masked, last_four_digits, expiry_date, type, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, 'credit_card', 0)`,
      [methodId, userId, card_holder_name, maskedNumber, lastFour, expiry_date]
    );

    res.status(201).json({ message: 'Payment method added', method_id: methodId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setDefaultPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { method_id } = req.params;

    // Verify method belongs to user
    const methodResult = await query(
      'SELECT id FROM payment_methods WHERE id = $1 AND user_id = $2',
      [method_id, userId]
    );

    if (methodResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // Remove default from all methods for this user
    await query(
      'UPDATE payment_methods SET is_default = 0 WHERE user_id = $1',
      [userId]
    );

    // Set as default
    await query(
      'UPDATE payment_methods SET is_default = 1 WHERE id = $1',
      [method_id]
    );

    res.json({ message: 'Default payment method updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { method_id } = req.params;

    // Verify method belongs to user
    const methodResult = await query(
      'SELECT id FROM payment_methods WHERE id = $1 AND user_id = $2',
      [method_id, userId]
    );

    if (methodResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await query(
      'DELETE FROM payment_methods WHERE id = $1',
      [method_id]
    );

    res.json({ message: 'Payment method removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
