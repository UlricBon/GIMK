import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const getSettings = (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('=== getSettings called for user:', userId);
    
    const result = query(
      `SELECT * FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default settings if none exist
      const defaults = {
        notifications_enabled: true,
        email_updates_enabled: true,
        task_alerts_enabled: true,
        message_alerts_enabled: true,
        dark_mode: false,
        location_services: true,
        profile_privacy: 'public',
        show_online_status: true,
        allow_messages: true,
      };
      console.log('Returning default settings for user:', userId, defaults);
      return res.json({ settings: defaults });
    }

    let settings = result.rows[0];
    console.log('Raw settings from DB:', settings);
    console.log('Raw dark_mode:', settings.dark_mode, 'type:', typeof settings.dark_mode);
    
    // Convert SQLite 0/1 to boolean for all boolean fields
    // Any truthy value (including non-zero numbers and strings) becomes true
    settings.dark_mode = Boolean(settings.dark_mode);
    settings.notifications_enabled = Boolean(settings.notifications_enabled);
    settings.email_updates_enabled = Boolean(settings.email_updates_enabled);
    settings.task_alerts_enabled = Boolean(settings.task_alerts_enabled);
    settings.message_alerts_enabled = Boolean(settings.message_alerts_enabled);
    settings.location_services = Boolean(settings.location_services);
    settings.show_online_status = Boolean(settings.show_online_status);
    settings.allow_messages = Boolean(settings.allow_messages);
    
    console.log('Converted dark_mode:', settings.dark_mode, 'type:', typeof settings.dark_mode);
    console.log('Converted settings:', settings);
    res.json({ settings });
  } catch (error) {
    console.error('Error in getSettings:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('=== updateSettings called ===', { userId });
    
    const {
      notifications_enabled,
      email_updates_enabled,
      task_alerts_enabled,
      message_alerts_enabled,
      dark_mode,
      location_services,
      profile_privacy,
      show_online_status,
      allow_messages,
    } = req.body;

    console.log('Request body:', req.body);
    console.log('dark_mode value:', dark_mode, 'type:', typeof dark_mode);

    // Helper function to convert boolean to 0/1
    const boolToInt = (val, defaultVal) => {
      const result = val !== undefined ? val : defaultVal;
      return result ? 1 : 0;
    };

    // Check if settings exist
    const checkResult = query(
      `SELECT id FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    console.log('Existing settings check:', checkResult);

    const now = new Date().toISOString();

    // Prepare the values with proper type conversion
    const notificationsVal = boolToInt(notifications_enabled, true);
    const emailUpdatesVal = boolToInt(email_updates_enabled, true);
    const taskAlertsVal = boolToInt(task_alerts_enabled, true);
    const messageAlertsVal = boolToInt(message_alerts_enabled, true);
    const darkModeVal = boolToInt(dark_mode, false);
    const locationServicesVal = boolToInt(location_services, true);
    const showOnlineStatusVal = boolToInt(show_online_status, true);
    const allowMessagesVal = boolToInt(allow_messages, true);
    const privacyVal = profile_privacy ?? 'public';

    console.log('Converted values:', {
      notifications_enabled: notificationsVal,
      email_updates_enabled: emailUpdatesVal,
      task_alerts_enabled: taskAlertsVal,
      message_alerts_enabled: messageAlertsVal,
      dark_mode: darkModeVal,
      location_services: locationServicesVal,
      profile_privacy: privacyVal,
      show_online_status: showOnlineStatusVal,
      allow_messages: allowMessagesVal,
    });

    if (checkResult.rows.length === 0) {
      // Insert new settings with generated UUID and timestamp
      const settingsId = uuidv4();
      console.log('Creating new settings for user:', userId);
      query(
        `INSERT INTO user_settings 
        (id, user_id, notifications_enabled, email_updates_enabled, task_alerts_enabled, 
         message_alerts_enabled, dark_mode, location_services, profile_privacy, 
         show_online_status, allow_messages, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          settingsId,
          userId,
          notificationsVal,
          emailUpdatesVal,
          taskAlertsVal,
          messageAlertsVal,
          darkModeVal,
          locationServicesVal,
          privacyVal,
          showOnlineStatusVal,
          allowMessagesVal,
          now,
          now,
        ]
      );
      console.log('New settings inserted');
    } else {
      // Update existing settings
      console.log('Updating existing settings for user:', userId);
      
      const updateResult = query(
        `UPDATE user_settings SET
         notifications_enabled = $2,
         email_updates_enabled = $3,
         task_alerts_enabled = $4,
         message_alerts_enabled = $5,
         dark_mode = $6,
         location_services = $7,
         profile_privacy = $8,
         show_online_status = $9,
         allow_messages = $10,
         updated_at = $11
         WHERE user_id = $1`,
        [
          userId,
          notificationsVal,
          emailUpdatesVal,
          taskAlertsVal,
          messageAlertsVal,
          darkModeVal,
          locationServicesVal,
          privacyVal,
          showOnlineStatusVal,
          allowMessagesVal,
          now,
        ]
      );
      console.log('Update result:', updateResult);
    }

    // Return the updated settings
    const getResult = query(
      `SELECT * FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    console.log('Retrieved settings after update:', getResult.rows[0]);

    let returnSettings;
    if (getResult.rows[0]) {
      returnSettings = getResult.rows[0];
      console.log('Raw dark_mode from DB:', returnSettings.dark_mode, 'type:', typeof returnSettings.dark_mode);
      
      // Convert SQLite 0/1 to boolean
      returnSettings.dark_mode = Boolean(returnSettings.dark_mode);
      returnSettings.notifications_enabled = Boolean(returnSettings.notifications_enabled);
      returnSettings.email_updates_enabled = Boolean(returnSettings.email_updates_enabled);
      returnSettings.task_alerts_enabled = Boolean(returnSettings.task_alerts_enabled);
      returnSettings.message_alerts_enabled = Boolean(returnSettings.message_alerts_enabled);
      returnSettings.location_services = Boolean(returnSettings.location_services);
      returnSettings.show_online_status = Boolean(returnSettings.show_online_status);
      returnSettings.allow_messages = Boolean(returnSettings.allow_messages);
      
      console.log('Converted dark_mode to boolean:', returnSettings.dark_mode);
    } else {
      returnSettings = {
        notifications_enabled: notificationsVal,
        email_updates_enabled: emailUpdatesVal,
        task_alerts_enabled: taskAlertsVal,
        message_alerts_enabled: messageAlertsVal,
        dark_mode: darkModeVal,
        location_services: locationServicesVal,
        profile_privacy: privacyVal,
        show_online_status: showOnlineStatusVal,
        allow_messages: allowMessagesVal,
      };
    }

    console.log('Returning to frontend:', returnSettings);
    res.json({ 
      message: 'Settings updated successfully',
      settings: returnSettings
    });
  } catch (error) {
    console.error('Error in updateSettings:', error.message);
    res.status(500).json({ error: error.message });
  }
};
