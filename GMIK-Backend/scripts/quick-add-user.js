#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, saveDatabase, getDatabase } from '../config/database.js';
import initializeTables from '../database/schema.js';

async function addUser() {
  try {
    await initializeDatabase();
    initializeTables();
    
    const db = getDatabase();
    
    const userId = uuidv4();
    const userEmail = 'bob@gmik.com';
    const userPassword = 'bobpassword';
    const userName = 'Bob Smith';
    
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const now = new Date().toISOString();
    
    // Insert using direct db.run
    db.run(
      `INSERT INTO users (id, email, password_hash, display_name, email_verified, is_active, completed_tasks_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, 1, 0, ?, ?)`,
      [userId, userEmail, hashedPassword, userName, now, now]
    );
    
    saveDatabase();
    
    console.log('✓ Test user created successfully!');
    console.log(`\nLogin with:`);
    console.log(`  Email: ${userEmail}`);
    console.log(`  Password: ${userPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

addUser();
