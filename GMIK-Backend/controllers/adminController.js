import { query } from '../database/db.js';

export const getUsers = async (req, res) => {
  try {
    const { role = 'user' } = req.query;
    
    const result = await query(
      `SELECT id, email, display_name, completed_tasks_count, is_active, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 100`
    );

    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const disableUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
    res.json({ message: 'User disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM activity_logs
       ORDER BY created_at DESC
       LIMIT 500`
    );

    res.json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSystemMetrics = async (req, res) => {
  try {
    const totalUsers = await query('SELECT COUNT(*) FROM users');
    const activeTasks = await query('SELECT COUNT(*) FROM tasks WHERE status IN ($1, $2)', ['posted', 'accepted']);
    const completedTasks = await query('SELECT COUNT(*) FROM task_acceptance WHERE completed_at IS NOT NULL');
    const totalPayments = await query('SELECT SUM(amount) FROM payments WHERE confirmed = true');

    res.json({
      metrics: {
        totalUsers: totalUsers.rows[0].count,
        activeTasks: activeTasks.rows[0].count,
        completedTasks: completedTasks.rows[0].count,
        totalPaymentsProcessed: totalPayments.rows[0].sum || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const moderateContent = async (req, res) => {
  try {
    const { taskId, action } = req.body;
    
    if (action === 'remove') {
      await query('UPDATE tasks SET status = $1 WHERE id = $2', ['flagged', taskId]);
    }

    res.json({ message: 'Content moderation action completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
