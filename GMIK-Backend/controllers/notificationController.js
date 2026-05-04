import { query } from '../database/db.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ notifications: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await query('UPDATE notifications SET is_read = true WHERE id = $1', [notificationId]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
