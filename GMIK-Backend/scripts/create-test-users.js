#!/usr/bin/env node

/**
 * Create test user accounts
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, getDatabase, saveDatabase } from '../config/database.js';
import { query } from '../database/db.js';

const testUsers = [
  { email: 'alice@gmik.com', password: 'alicepassword', name: 'Alice Johnson' },
  { email: 'bob@gmik.com', password: 'bobpassword', name: 'Bob Smith' },
];

async function createTestUsers() {
  try {
    await initializeDatabase();
    
    const db = getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    for (const user of testUsers) {
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const now = new Date().toISOString();
      
      // Use the query function to properly insert
      query(
        `INSERT INTO users (id, email, password_hash, display_name, email_verified, is_active, completed_tasks_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, 1, 0, ?, ?)`,
        [userId, user.email, hashedPassword, user.name, now, now]
      );
      
      console.log(`✓ Created user: ${user.email}`);
    }
    
    saveDatabase();
    
    // Verify users were created
    console.log('\n✓ Test users created successfully!');
    console.log('\nLogin credentials:');
    for (const user of testUsers) {
      const result = query('SELECT id FROM users WHERE email = ?', [user.email]);
      if (result.rows.length > 0) {
        console.log(`  ✓ ${user.email} / ${user.password}`);
      } else {
        console.log(`  ✗ ${user.email} (FAILED TO CREATE)`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
