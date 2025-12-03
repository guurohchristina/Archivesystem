/*import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;*/


// src/config/db.js
/*fall back onnnnnn
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection function
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL database');
    
    // Test query to verify connection
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📊 Connection test successful:', result.rows[0].current_time);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Generic query function
export const query = (text, params) => pool.query(text, params);*/




// src/config/db.js - UPDATED FOR NEON
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// For Neon, SSL is ALWAYS required
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false }
  : { rejectUnauthorized: false }; // Same for development!

// Create connection pool with Neon-specific settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig, // ALWAYS use SSL with Neon
  max: 10, // Lower for Neon (serverless)
  idleTimeoutMillis: 10000, // Shorter for Neon
  connectionTimeoutMillis: 5000,
});

// Enhanced connection test
export const testConnection = async () => {
  console.log('🔗 Testing Neon PostgreSQL connection...');
  console.log('SSL enabled:', pool.options.ssl ? 'Yes' : 'No');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('📊 Current time:', result.rows[0].current_time);
    console.log('📊 PostgreSQL version:', result.rows[0].version.substring(0, 50));
    
    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Available tables:', tables.rows.map(t => t.table_name));
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Diagnostic info
    if (error.message.includes('SSL')) {
      console.error('💡 SSL Error: Neon requires SSL. Add ?sslmode=require to DATABASE_URL');
    }
    if (error.message.includes('connection')) {
      console.error('💡 Connection Error: Check if Neon instance is paused at neon.tech');
    }
    
    return false;
  }
};

// Enhanced query function with logging
export const query = async (text, params) => {
  const start = Date.now();
  
  console.log('\n📊 === DATABASE QUERY ===');
  console.log('SQL:', text.substring(0, 200));
  if (params && params.length > 0) {
    console.log('Params:', params);
  }
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✅ Query successful (${duration}ms, ${result.rowCount} rows)`);
    
    if (result.rows.length > 0 && result.rows.length <= 3) {
      console.log('Result:', result.rows);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Query failed (${duration}ms)`);
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Query:', text);
    
    // Neon-specific error handling
    if (error.code === '08006' || error.message.includes('SSL')) {
      console.error('💡 Neon SSL Fix: Add ?sslmode=require to your DATABASE_URL in .env');
      console.error('   Example: postgresql://user:pass@neon-host/db?sslmode=require');
    }
    
    throw error;
  }
};