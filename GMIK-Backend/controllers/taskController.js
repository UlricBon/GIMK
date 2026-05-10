import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createTask = async (req, res) => {
  try {
    const { title, description, category, compensation, latitude, longitude, address, urgency, postType } = req.body;
    const dropperId = req.user.userId;

    if (!title || !category || !compensation || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const taskId = uuidv4();
    await query(
      `INSERT INTO tasks (id, dropper_id, title, description, category, compensation, location_latitude, location_longitude, location_address, urgency, post_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskId, dropperId, title, description, category, compensation, latitude, longitude, address, urgency, postType || 'job_offer']
    );

    // Fetch the newly created task
    const taskResult = await query(
      `SELECT t.*, u.display_name FROM tasks t JOIN users u ON t.dropper_id = u.id WHERE t.id = ?`,
      [taskId]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: taskResult.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query_str = `
      SELECT t.*, u.display_name, u.completed_tasks_count
      FROM tasks t
      JOIN users u ON t.dropper_id = u.id
      WHERE t.status = 'posted'
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      query_str += ` AND t.category = ?`;
    }

    if (search) {
      params.push(`%${search}%`);
      query_str += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`);
    }

    query_str += ` ORDER BY t.created_at DESC LIMIT 50`;

    const result = await query(query_str, params);
    res.json({ tasks: result.rows || [] });
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
       WHERE t.id = ?`,
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
      'SELECT id FROM task_acceptance WHERE task_id = ?',
      [id]
    );

    if (existingAcceptance.rows.length > 0) {
      return res.status(409).json({ error: 'Task already accepted' });
    }

    // Accept task
    const acceptanceId = uuidv4();
    await query(
      'INSERT INTO task_acceptance (id, task_id, chaser_id) VALUES (?, ?, ?)',
      [acceptanceId, id, chaserId]
    );

    // Update task status
    await query('UPDATE tasks SET status = ? WHERE id = ?', ['accepted', id]);

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
    const taskResult = await query('SELECT dropper_id FROM tasks WHERE id = ?', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (taskResult.rows[0].dropper_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    await query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);

    if (status === 'done') {
      // Increment chaser's completed task count
      await query(
        `UPDATE users SET completed_tasks_count = completed_tasks_count + 1
         WHERE id = (SELECT chaser_id FROM task_acceptance WHERE task_id = ?)`,
        [id]
      );
    }

    res.json({ message: 'Task status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, compensation, urgency, address } = req.body;
    const userId = req.user.userId;

    // Check authorization
    const taskResult = await query('SELECT dropper_id FROM tasks WHERE id = ?', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (taskResult.rows[0].dropper_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (compensation !== undefined) { updates.push('compensation = ?'); values.push(compensation); }
    if (urgency !== undefined) { updates.push('urgency = ?'); values.push(urgency); }
    if (address !== undefined) { updates.push('location_address = ?'); values.push(address); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const updateQuery = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    await query(updateQuery, values);

    // Fetch and return updated task
    const updatedResult = await query(
      `SELECT t.*, u.display_name FROM tasks t JOIN users u ON t.dropper_id = u.id WHERE t.id = ?`,
      [id]
    );

    res.json({ message: 'Task updated successfully', task: updatedResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log('Delete request - Task ID:', id, 'User ID:', userId);

    // Check authorization
    const result = await query('SELECT dropper_id FROM tasks WHERE id = ?', [id]);
    console.log('Task lookup result:', result);
    
    if (result.rows.length === 0) {
      console.log('Task not found:', id);
      return res.status(404).json({ error: 'Task not found' });
    }

    if (result.rows[0].dropper_id !== userId) {
      console.log('Authorization failed - Task dropper:', result.rows[0].dropper_id, 'User:', userId);
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    console.log('Deleting task:', id);
    await query('DELETE FROM tasks WHERE id = ?', [id]);
    console.log('Task deleted successfully');
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's own tasks
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    let query_str = `
      SELECT t.*, u.display_name
      FROM tasks t
      JOIN users u ON t.dropper_id = u.id
      WHERE t.dropper_id = ?
    `;
    const params = [userId];

    if (status && status !== 'all') {
      params.push(status);
      query_str += ` AND t.status = ?`;
    }

    query_str += ` ORDER BY t.created_at DESC`;

    const result = await query(query_str, params);
    res.json({ tasks: result.rows || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
