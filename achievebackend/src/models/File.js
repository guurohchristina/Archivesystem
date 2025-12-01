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
};