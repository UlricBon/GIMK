import { query } from '../database/db.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await query(
      `SELECT id, email, display_name, profile_picture_url, completed_tasks_count, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { displayName, profilePictureUrl } = req.body;

    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    if (displayName) {
      params.push(displayName);
      updateFields.push(`display_name = $${paramIndex}`);
      paramIndex++;
    }

    if (profilePictureUrl) {
      params.push(profilePictureUrl);
      updateFields.push(`profile_picture_url = $${paramIndex}`);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(userId);
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(updateQuery, params);
    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const switchRole = async (req, res) => {
  try {
    // For MVP, users are always both Dropper and Chaser
    // This endpoint can be used to track role preferences in future versions
    res.json({ message: 'Role switching available in both directions' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
