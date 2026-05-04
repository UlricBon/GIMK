import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createTask = async (req, res) => {
  try {
    const { title, description, category, compensation, latitude, longitude, address, urgency } = req.body;
    const dropperId = req.user.userId;

    if (!title || !category || !compensation || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const taskId = uuidv4();
    const result = await query(
      `INSERT INTO tasks (id, dropper_id, title, description, category, compensation, location, location_address, urgency)
       VALUES ($1, $2, $3, $4, $5, $6, POINT($7, $8), $9, $10)
       RETURNING *`,
      [taskId, dropperId, title, description, category, compensation, longitude, latitude, address, urgency]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { category, latitude, longitude, radius = 5, search } = req.query;

    let query_str = `
      SELECT t.*, u.display_name, u.completed_tasks_count, 
             CASE WHEN ta.id IS NOT NULL THEN 'accepted' ELSE 'posted' END as status
      FROM tasks t
      JOIN users u ON t.dropper_id = u.id
      LEFT JOIN task_acceptance ta ON t.id = ta.task_id
      WHERE t.status = 'posted'
    `;
    const params = [];

    if (category) {
      params.push(category);
      query_str += ` AND t.category = $${params.length}`;
    }

    if (latitude && longitude) {
      params.push(radius);
      params.push(longitude);
      params.push(latitude);
      query_str += ` AND ST_DWithin(t.location, POINT($${params.length - 1}, $${params.length}), $${params.length - 2} * 1000)`;
    }

    if (search) {
      params.push(`%${search}%`);
      query_str += ` AND (t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
    }

    query_str += ` ORDER BY t.created_at DESC LIMIT 50`;

    const result = await query(query_str, params);
    res.json({ tasks: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT t.*, u.display_name, u.completed_tasks_count
       FROM tasks t
       JOIN users u ON t.dropper_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptTask = async (req, res) => {
  try {
    const { id } = req.params;
    const chaserId = req.user.userId;

    // Check if task is already accepted
    const existingAcceptance = await query(
      'SELECT id FROM task_acceptance WHERE task_id = $1',
      [id]
    );

    if (existingAcceptance.rows.length > 0) {
      return res.status(409).json({ error: 'Task already accepted' });
    }

    // Accept task
    const acceptanceId = uuidv4();
    await query(
      'INSERT INTO task_acceptance (id, task_id, chaser_id) VALUES ($1, $2, $3)',
      [acceptanceId, id, chaserId]
    );

    // Update task status
    await query('UPDATE tasks SET status = $1 WHERE id = $2', ['accepted', id]);

    res.json({ message: 'Task accepted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const validStatuses = ['posted', 'accepted', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check authorization
    const taskResult = await query('SELECT dropper_id FROM tasks WHERE id = $1', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (taskResult.rows[0].dropper_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    await query('UPDATE tasks SET status = $1 WHERE id = $2', [status, id]);

    if (status === 'done') {
      // Increment chaser's completed task count
      await query(
        `UPDATE users SET completed_tasks_count = completed_tasks_count + 1
         WHERE id = (SELECT chaser_id FROM task_acceptance WHERE task_id = $1)`,
        [id]
      );
    }

    res.json({ message: 'Task status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check authorization
    const result = await query('SELECT dropper_id FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (result.rows[0].dropper_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
