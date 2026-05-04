import { getDatabase, saveDatabase } from '../config/database.js';

export function query(text, params = []) {
  const start = Date.now();
  try {
    const db = getDatabase();
    if (!db) throw new Error('Database not initialized');
    
    // Convert PostgreSQL-style placeholders ($1, $2, etc.) to sql.js placeholders (?)
    let sqlText = text;
    const isPostgresStyle = /\$[0-9]/.test(sqlText);
    
    if (isPostgresStyle) {
      // Replace $1, $2, etc. with ?
      sqlText = sqlText.replace(/\$[0-9]+/g, '?');
    }
    
    // Handle different query types
    if (sqlText.trim().toUpperCase().startsWith('SELECT')) {
      // For SELECT queries, use prepare/bind/step
      const stmt = db.prepare(sqlText);
      
      // Bind parameters
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      
      const duration = Date.now() - start;
      console.log('SELECT query', { duration, rows: rows.length, email: params[0] });
      return { rows };
    } else {
      // For INSERT/UPDATE/DELETE, use exec or run
      db.run(sqlText, params);
      saveDatabase();
      
      const duration = Date.now() - start;
      console.log('Mutation query', { duration, type: sqlText.split(/\s+/)[0] });
      return { rows: [], changes: db.getRowsModified() };
    }
  } catch (error) {
    console.error('Database query error', { sql: text.substring(0, 50), error: error.message });
    throw error;
  }
}

export function getClient() {
  return getDatabase();
}
