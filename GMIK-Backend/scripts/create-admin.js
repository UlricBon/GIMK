#!/usr/bin/env node

/**
 * Create admin user in the database
 * Run: node scripts/create-admin.js
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, getDatabase, saveDatabase } from '../config/database.js';

async function createAdmin() {
  try {
    await initializeDatabase();
    
    const db = getDatabase();
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const adminId = uuidv4();
    const adminEmail = 'admin@gmik.com';
    const adminPassword = 'adminpassword';
    const adminName = 'GMIK Admin';
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const now = new Date().toISOString();
    
    // Use exec for DDL/DML operations in sql.js
    db.exec(`
      INSERT OR IGNORE INTO users (id, email, password_hash, display_name, email_verified, is_active, completed_tasks_count, created_at, updated_at)
      VALUES ('${adminId}', '${adminEmail}', '${hashedPassword}', '${adminName}', 1, 1, 0, '${now}', '${now}')
    `);
    
    saveDatabase();
    
    // Verify insertion
    const result = db.exec(`SELECT * FROM users WHERE email = '${adminEmail}'`);
    
    if (result.length > 0 && result[0].values.length > 0) {
      console.log('✓ Admin user created successfully!');
      console.log(`\nLogin credentials:`);
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`\nAccess at: http://localhost:3001`);
    } else {
      console.log('⚠️  Admin user creation status unclear');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to create admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
