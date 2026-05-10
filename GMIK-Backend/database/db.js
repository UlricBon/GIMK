import { getDatabase, saveDatabase } from '../config/database.js';

// Helper to substitute PostgreSQL-style parameters ($1, $2, etc.)
function substituteSqlParams(sqlText, params) {
  let result = sqlText;
  
  // For PostgreSQL-style placeholders ($1, $2, ...), substitute them directly
  // This preserves the correct order
  const isPostgresStyle = /\$[0-9]/.test(sqlText);
  
  if (isPostgresStyle) {
    // Replace $1, $2, $3... with actual values in the correct order
    result = result.replace(/\$([0-9]+)/g, (match, indexStr) => {
      const index = parseInt(indexStr, 10);
      const paramIndex = index - 1; // Convert 1-based to 0-based
      
      if (paramIndex >= params.length) {
        throw new Error(`Parameter ${indexStr} referenced but only ${params.length} parameters provided`);
      }
      
      const param = params[paramIndex];
      return formatSqlParam(param);
    });
  } else {
    // For standard ? placeholders, substitute left to right
    let paramIndex = 0;
    result = result.replace(/\?/g, () => {
      if (paramIndex >= params.length) {
        throw new Error(`Not enough parameters provided. Expected ${params.length} but ran out`);
      }
      return formatSqlParam(params[paramIndex++]);
    });
  }
  
  return result;
}

// Helper to format a single SQL parameter
function formatSqlParam(param) {
  if (param === null || param === undefined) {
    return 'NULL';
  } else if (typeof param === 'string') {
    const escaped = param.replace(/'/g, "''");
    return `'${escaped}'`;
  } else if (typeof param === 'boolean') {
    return param ? '1' : '0';
  } else if (typeof param === 'number') {
    return param.toString();
  } else {
    const escaped = String(param).replace(/'/g, "''");
    return `'${escaped}'`;
  }
}

export function query(text, params = []) {
  const start = Date.now();
  try {
    const db = getDatabase();
    if (!db) throw new Error('Database not initialized');
    
    let sqlText = text;
    
    // Check if this is a SELECT query
    const isSelect = sqlText.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      // For SELECT queries, we need to convert PostgreSQL placeholders to ?
      // Then use prepare/bind
      let processedSql = sqlText;
      const isPostgresStyle = /\$[0-9]/.test(sqlText);
      
      if (isPostgresStyle) {
        // Replace $1, $2, etc. with ?
        processedSql = sqlText.replace(/\$[0-9]+/g, '?');
      }
      
      const stmt = db.prepare(processedSql);
      
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
      console.log('SELECT query', { duration, rows: rows.length });
      return { rows };
    } else {
      // For INSERT/UPDATE/DELETE, substitute parameters directly and use db.run()
      console.log('=== MUTATION QUERY ===');
      console.log('Original SQL:', sqlText.substring(0, 150));
      console.log('Params:', params);
      
      // Substitute parameters into SQL (keeping PostgreSQL style)
      const substitutedSql = substituteSqlParams(sqlText, params);
      console.log('Substituted SQL:', substitutedSql.substring(0, 250));
      
      // Execute using db.run()
      db.run(substitutedSql);
      console.log('db.run() executed');
      
      // Get rows modified
      const changes = db.getRowsModified();
      console.log('Rows modified by mutation:', changes);
      
      // Save the database after mutation
      console.log('Saving database...');
      saveDatabase();
      console.log('Database saved successfully');
      
      const duration = Date.now() - start;
      console.log('Mutation completed', { duration, type: sqlText.split(/\s+/)[0], changes });
      return { rows: [], changes };
    }
  } catch (error) {
    console.error('Database query error', { sql: text.substring(0, 50), error: error.message, stack: error.stack });
    throw error;
  }
}

export function getClient() {
  return getDatabase();
}
