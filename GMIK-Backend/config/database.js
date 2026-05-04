import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'gmik.db');

let db = null;
let SQL = null;

export async function initializeDatabase() {
  if (SQL) return db;
  
  SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✓ Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('✓ Created new database');
  }
  
  return db;
}

export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export function getDatabase() {
  return db;
}

export default {
  initializeDatabase,
  saveDatabase,
  getDatabase
};
