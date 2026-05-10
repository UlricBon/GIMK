import { getDatabase, saveDatabase } from '../config/database.js';

export const initializeTables = () => {
  try {
    const db = getDatabase();
    if (!db) throw new Error('Database not initialized');
    
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        profile_picture_url TEXT,
        email_verified INTEGER DEFAULT 0,
        completed_tasks_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        last_latitude REAL,
        last_longitude REAL
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

    // Tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        dropper_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        compensation REAL NOT NULL,
        location_latitude REAL NOT NULL,
        location_longitude REAL NOT NULL,
        location_address TEXT,
        status TEXT DEFAULT 'posted',
        urgency TEXT DEFAULT 'normal',
        post_type TEXT DEFAULT 'job_offer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY(dropper_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_dropper_id ON tasks(dropper_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);

    // Task acceptance table
    db.run(`
      CREATE TABLE IF NOT EXISTS task_acceptance (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL UNIQUE,
        chaser_id TEXT NOT NULL,
        accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        status TEXT DEFAULT 'accepted',
        FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY(chaser_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_task_acceptance_chaser_id ON task_acceptance(chaser_id)`);

    // Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        sender_id TEXT NOT NULL,
        recipient_id TEXT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_task_id ON messages(task_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);

    // Payments table
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL UNIQUE,
        dropper_id TEXT NOT NULL,
        chaser_id TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT,
        confirmed INTEGER DEFAULT 0,
        confirmed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY(dropper_id) REFERENCES users(id),
        FOREIGN KEY(chaser_id) REFERENCES users(id)
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_payments_dropper_id ON payments(dropper_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_payments_chaser_id ON payments(chaser_id)`);

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        body TEXT,
        task_id TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE SET NULL
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`);

    // Activity logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at)`);

    // User Settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        notifications_enabled INTEGER DEFAULT 1,
        email_updates_enabled INTEGER DEFAULT 1,
        dark_mode INTEGER DEFAULT 0,
        location_services INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)`);

    // Support Tickets table
    db.run(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)`);

    // Payment Methods table (if not exists)
    db.run(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        card_holder_name TEXT NOT NULL,
        card_number_masked TEXT NOT NULL,
        last_four_digits TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        type TEXT DEFAULT 'credit_card',
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id)`);

    saveDatabase();
    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
};

export default initializeTables;
