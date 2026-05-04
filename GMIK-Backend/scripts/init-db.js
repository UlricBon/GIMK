#!/usr/bin/env node

/**
 * Database initialization script for GMIK
 * Initializes SQL.js database with schema
 * Run this once before starting the server: npm run db:init
 */

import { initializeDatabase, saveDatabase } from '../config/database.js';
import initializeTables from '../database/schema.js';

async function initDatabase() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    initializeTables();
    saveDatabase();
    
    console.log('\n✓ Database initialization complete!');
    console.log('Database file: gmik.db');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase();
