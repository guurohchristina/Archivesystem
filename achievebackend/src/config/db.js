/*import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;*/


// src/config/db.js
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
export const query = (text, params) => pool.query(text, params);