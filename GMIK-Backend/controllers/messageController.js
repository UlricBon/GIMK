import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const getMessages = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of this task
    const taskCheck = await query(
      `SELECT t.dropper_id, ta.chaser_id FROM tasks t
       LEFT JOIN task_acceptance ta ON t.id = ta.task_id
       WHERE t.id = $1`,
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { dropper_id, chaser_id } = taskCheck.rows[0];
    if (userId !== dropper_id && userId !== chaser_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await query(
      `SELECT m.*, u.display_name, u.profile_picture_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.task_id = $1
       ORDER BY m.created_at ASC`,
      [taskId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const senderId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const messageId = uuidv4();
    await query(
      'INSERT INTO messages (id, task_id, sender_id, content) VALUES ($1, $2, $3, $4)',
      [messageId, taskId, senderId, content]
    );

    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
