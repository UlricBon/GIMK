#!/usr/bin/env node

/**
 * Create regular user account in the database
 * Run: node scripts/create-user.js
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, getDatabase, saveDatabase } from '../config/database.js';

async function createUser() {
  try {
    await initializeDatabase();
    
    const db = getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const userId = uuidv4();
    const userEmail = 'user@gmik.com';
    const userPassword = 'userpassword';
    const userName = 'Regular User';
    
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const now = new Date().toISOString();
    
    // Use exec for DDL/DML operations in sql.js
    db.exec(`
      INSERT OR IGNORE INTO users (id, email, password_hash, display_name, email_verified, is_active, completed_tasks_count, created_at, updated_at)
      VALUES ('${userId}', '${userEmail}', '${hashedPassword}', '${userName}', 1, 1, 0, '${now}', '${now}')
    `);
    
    saveDatabase();
    
    // Verify insertion
    const result = db.exec(`SELECT * FROM users WHERE email = '${userEmail}'`);
    
    if (result.length > 0 && result[0].values.length > 0) {
      console.log('✓ Regular user account created successfully!');
      console.log(`\nLogin credentials:`);
      console.log(`  Email: ${userEmail}`);
      console.log(`  Password: ${userPassword}`);
      console.log(`\nYou can now log in with these credentials in the app!`);
    } else {
      console.log('⚠️  User account creation status unclear');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating user:', error.message);
    process.exit(1);
  }
}

createUser();
