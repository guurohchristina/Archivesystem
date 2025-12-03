// models/File.js

/*class FileModel {
  constructor(pool) {
    this.pool = pool;
  }

  async create(fileData) {
    const {
      filename,
      filepath,
      filetype,
      document_type,
      document_date,
      department,
      owner,
      classification_level,
      tags,
      project_name,
      version,
      status,
      expiry_date,
    } = fileData;

    const sql = `
      INSERT INTO files (
        filename, filepath, filetype,
        document_type, document_date, department, owner, classification_level,
        tags, project_name, version, status, expiry_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;

    const values = [
      filename, filepath, filetype,
      document_type, document_date, department, owner, classification_level,
      tags, project_name, version, status, expiry_date
    ];

    const result = await this.pool.query(sql, values);
    return result.rows[0];
  }
}

export default FileModel;*/


// src/models/File.js

/*FALL BAC ON
import { query } from '../config/db.js';

export const FileModel = {
  // Create file record
  create: async (fileData) => {
    const { filename, originalname, mimetype, size, path, userId } = fileData;
    const result = await query(
      `INSERT INTO files (filename, originalname, mimetype, size, path, user_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [filename, originalname, mimetype, size, path, userId]
    );
    return result.rows[0];
  },

  // Find file by ID
  findById: async (id) => {
    const result = await query('SELECT * FROM files WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Find files by user
  findByUser: async (userId) => {
    const result = await query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  // Delete file
  delete: async (id) => {
    const result = await query('DELETE FROM files WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};*/






// models/File.js (or files.js)
import { query } from '../config/db.js';

export const FileModel = {
  // Create file record - UPDATED to match your table schema
  create: async (fileData) => {
    const {
      filename,
      filepath,
      filetype,
      original_name,
      file_size,
      user_id,
      description = '',
      is_public = false,
      document_type = '',
      document_date = null,
      department = '',
      owner = '',
      classification_level = 'Unclassified'
    } = fileData;
    
    const result = await query(
      `INSERT INTO files (
        filename, filepath, filetype, original_name, file_size,
        user_id, description, is_public, document_type, document_date,
        department, owner, classification_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        filename,
        filepath,
        filetype,
        original_name,
        file_size,
        user_id,
        description,
        is_public,
        document_type,
        document_date,
        department,
        owner,
        classification_level
      ]
    );
    return result.rows[0];
  },

  // Find file by ID
  findById: async (id) => {
    const result = await query('SELECT * FROM files WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Find files by user ID
  findByUserId: async (userId) => {
    const result = await query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );
    return result.rows;
  },

  // Find file by ID and user ID (for security)
  findByIdAndUser: async (id, userId) => {
    const result = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  },

  // Update file metadata
  update: async (id, updateData) => {
    const {
      description,
      is_public,
      document_type,
      document_date,
      department,
      owner,
      classification_level
    } = updateData;
    
    const result = await query(
      `UPDATE files 
       SET description = COALESCE($1, description),
           is_public = COALESCE($2, is_public),
           document_type = COALESCE($3, document_type),
           document_date = COALESCE($4, document_date),
           department = COALESCE($5, department),
           owner = COALESCE($6, owner),
           classification_level = COALESCE($7, classification_level),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        description,
        is_public,
        document_type,
        document_date,
        department,
        owner,
        classification_level,
        id
      ]
    );
    return result.rows[0];
  },

  // Delete file
  delete: async (id) => {
    const result = await query('DELETE FROM files WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Delete file by ID and user ID (for security)
  deleteByIdAndUser: async (id, userId) => {
    const result = await query(
      'DELETE FROM files WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  },

  // Get file statistics for user
  getStats: async (userId) => {
    const result = await query(
      `SELECT 
        COUNT(*) as total_files,
        COALESCE(SUM(file_size), 0) as total_size,
        COUNT(DISTINCT document_type) as document_types,
        COUNT(DISTINCT department) as departments
       FROM files 
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },

  // Search files
  search: async (userId, searchParams) => {
    const { 
      query: searchQuery, 
      document_type, 
      department, 
      classification_level,
      limit = 50,
      offset = 0
    } = searchParams;
    
    let sql = 'SELECT * FROM files WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;
    
    if (searchQuery) {
      paramCount++;
      sql += ` AND (original_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${searchQuery}%`);
    }
    
    if (document_type) {
      paramCount++;
      sql += ` AND document_type = $${paramCount}`;
      params.push(document_type);
    }
    
    if (department) {
      paramCount++;
      sql += ` AND department = $${paramCount}`;
      params.push(department);
    }
    
    if (classification_level) {
      paramCount++;
      sql += ` AND classification_level = $${paramCount}`;
      params.push(classification_level);
    }
    
    sql += ` ORDER BY uploaded_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    return result.rows;
  }
};