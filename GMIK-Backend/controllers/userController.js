import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
// Rate another user (1-5 stars, optional comment)
export const rateUser = async (req, res) => {
  try {
    const raterId = req.user.userId;
    const rateeId = req.params.id;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }
    if (raterId === rateeId) {
      return res.status(400).json({ error: 'Cannot rate yourself' });
    }
    // Upsert (one rating per rater/ratee)
    const id = uuidv4();
    await query(
      `INSERT INTO user_ratings (id, rater_id, ratee_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT(rater_id, ratee_id) DO UPDATE SET rating = $4, comment = $5, created_at = CURRENT_TIMESTAMP`,
      [id, raterId, rateeId, rating, comment || null]
    );
    res.json({ message: 'Rating submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ratings for a user (average, count, and recent ratings)
export const getUserRatings = async (req, res) => {
  try {
    const rateeId = req.params.id;
    const avgResult = await query(
      `SELECT AVG(rating) as avg, COUNT(*) as count FROM user_ratings WHERE ratee_id = $1`,
      [rateeId]
    );
    const ratingsResult = await query(
      `SELECT rater_id, rating, comment, created_at FROM user_ratings WHERE ratee_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [rateeId]
    );
    res.json({
      average: avgResult.rows[0].avg ? Number(avgResult.rows[0].avg).toFixed(2) : null,
      count: Number(avgResult.rows[0].count),
      ratings: ratingsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
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

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
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
    const { displayName, profilePictureUrl, bio, location } = req.body;

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
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id, email, display_name, profile_picture_url, completed_tasks_count, created_at`;

    const result = await query(updateQuery, params);
    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Remove rows that reference user without ON DELETE CASCADE.
    await query(
      `DELETE FROM payments WHERE dropper_id = $1 OR chaser_id = $1`,
      [userId]
    );

    const result = await query(
      `DELETE FROM users WHERE id = $1`,
      [userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT * FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      const settingsId = uuidv4();
      await query(
        `INSERT INTO user_settings (id, user_id, notifications_enabled, email_updates_enabled, dark_mode, location_services)
         VALUES ($1, $2, 1, 1, 0, 1)`,
        [settingsId, userId]
      );

      return res.json({ 
        settings: {
          notifications_enabled: true,
          email_updates_enabled: true,
          dark_mode: false,
          location_services: true
        }
      });
    }

    const settings = result.rows[0];
    res.json({ 
      settings: {
        notifications_enabled: !!settings.notifications_enabled,
        email_updates_enabled: !!settings.email_updates_enabled,
        dark_mode: !!settings.dark_mode,
        location_services: !!settings.location_services
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notifications_enabled, email_updates_enabled, dark_mode, location_services } = req.body;

    // Update or create settings
    const result = await query(
      `UPDATE user_settings 
       SET notifications_enabled = $1, email_updates_enabled = $2, dark_mode = $3, location_services = $4, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING *`,
      [notifications_enabled ? 1 : 0, email_updates_enabled ? 1 : 0, dark_mode ? 1 : 0, location_services ? 1 : 0, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json({ message: 'Settings updated', settings: result.rows[0] });
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
