/*import pool from "../config/db.js";

export const uploadFiles = async (req, res) => {
  try {
    const { title, department, owner, type, classification, date } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (let file of files) {
      const filePath = `/uploads/${file.filename}`;

      const query = `
        INSERT INTO files (title, department, owner, type, classification, date, file_path)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [title, department, owner, type, classification, date, filePath];
      const result = await pool.query(query, values);

      uploadedFiles.push(result.rows[0]);
    }

    res.status(201).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};*/


// src/controllers/uploadController.js fall back on

/*import { FileModel } from '../models/File.js';

export const uploadController = {
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileData = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        userId: req.user?.id || 1 // Get from auth middleware
      };

      const savedFile = await FileModel.create(fileData);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          id: savedFile.id,
          filename: savedFile.filename,
          originalname: savedFile.originalname,
          size: savedFile.size,
          url: `/uploads/${savedFile.filename}`
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: error.message
      });
    }
  },

  getFiles: async (req, res) => {
    try {
      const userId = req.user?.id || 1; // Get from auth middleware
      const files = await FileModel.findByUser(userId);
      
      res.json({
        success: true,
        data: files,
        count: files.length
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching files',
        error: error.message
      });
    }
  },

  deleteFile: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedFile = await FileModel.delete(id);
      
      if (!deletedFile) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // TODO: Delete actual file from storage

      res.json({
        success: true,
        message: 'File deleted successfully',
        data: deletedFile
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file',
        error: error.message
      });
    }
  }
};*/








// src/controllers/uploadController.js
/*import { query } from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File type not allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

export const uploadController = {
  uploadFile: async (req, res) => {
    try {
      const { description, isPublic } = req.body;
      const userId = req.user.userId;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Save to database
      const result = await query(
        `INSERT INTO files (filename, original_name, file_type, file_size, file_path, user_id, description, is_public) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          req.file.path,
          userId,
          description || '',
          isPublic === 'true'
        ]
      );

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: result.rows[0],
          url: `/uploads/${req.file.filename}`
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: error.message
      });
    }
  },

  getUserFiles: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10, sort = 'newest' } = req.query;
      const offset = (page - 1) * limit;

      let sortQuery = 'ORDER BY uploaded_at DESC';
      if (sort === 'oldest') sortQuery = 'ORDER BY uploaded_at ASC';
      if (sort === 'name') sortQuery = 'ORDER BY original_name ASC';
      if (sort === 'size') sortQuery = 'ORDER BY file_size DESC';

      // Get files
      const filesResult = await query(
        `SELECT f.*, 
                u.name as user_name,
                u.email as user_email
         FROM files f
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.user_id = $1
         ${sortQuery}
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM files WHERE user_id = $1',
        [userId]
      );

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          files: filesResult.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalFiles: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching files'
      });
    }
  },

  deleteFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId;

      // Check if file exists and belongs to user
      const fileResult = await query(
        'SELECT * FROM files WHERE id = $1 AND user_id = $2',
        [fileId, userId]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
      }

      const file = fileResult.rows[0];

      // Delete from filesystem
      fs.unlinkSync(file.file_path);

      // Delete from database
      await query('DELETE FROM files WHERE id = $1', [fileId]);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file'
      });
    }
  },

  updateFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId;
      const { description, isPublic } = req.body;

      const result = await query(
        `UPDATE files 
         SET description = $1, is_public = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [description, isPublic === 'true', fileId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'File updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating file'
      });
    }
  },

  shareFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId;
      const { sharedWith, permission = 'view' } = req.body;

      // Check if file exists and belongs to user
      const fileResult = await query(
        'SELECT * FROM files WHERE id = $1 AND user_id = $2',
        [fileId, userId]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
      }

      // Check if user exists
      const userResult = await query(
        'SELECT id FROM users WHERE id = $1',
        [sharedWith]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already shared
      const existingShare = await query(
        'SELECT * FROM shared_files WHERE file_id = $1 AND shared_with = $2',
        [fileId, sharedWith]
      );

      if (existingShare.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'File already shared with this user'
        });
      }

      // Share file
      const result = await query(
        `INSERT INTO shared_files (file_id, shared_by, shared_with, permission) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [fileId, userId, sharedWith, permission]
      );

      res.status(201).json({
        success: true,
        message: 'File shared successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Share error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sharing file'
      });
    }
  },

  getSharedFiles: async (req, res) => {
    try {
      const userId = req.user.userId;

      const result = await query(
        `SELECT f.*, 
                u.name as shared_by_name,
                u.email as shared_by_email,
                sf.permission,
                sf.shared_at
         FROM shared_files sf
         JOIN files f ON sf.file_id = f.id
         JOIN users u ON sf.shared_by = u.id
         WHERE sf.shared_with = $1
         ORDER BY sf.shared_at DESC`,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get shared files error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching shared files'
      });
    }
  }
};*/



/*fall back on

import { query } from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File type not allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter
});

export const uploadController = {
  uploadFile: async (req, res) => {
    try {
      console.log("📤 UPLOAD STARTED");
      console.log("📦 File info:", req.file);
      console.log("👤 User:", req.user);
      console.log("📝 Body:", req.body);

      const { 
        description, 
        isPublic,
        document_type,
        document_date,
        department,
        owner,
        classification_level
      } = req.body;
      
      const userId = req.user.userId;
      
      if (!req.file) {
        console.log("❌ No file in request");
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Prepare date for database (convert empty string to null)
      const docDate = document_date ? new Date(document_date).toISOString().split('T')[0] : null;

      console.log("💾 Saving to database...");
      console.log("📅 Document date:", docDate);

      // Save to database with new column structure
      const result = await query(
        `INSERT INTO files (
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING *`,
        [
          req.file.filename,                    // $1: filename (generated unique name)
          req.file.path,                        // $2: filepath
          req.file.mimetype,                    // $3: filetype
          req.file.originalname,                // $4: original_name
          req.file.size,                        // $5: file_size
          userId,                               // $6: user_id
          description || '',                    // $7: description
          isPublic === 'true',                  // $8: is_public
          document_type || '',                  // $9: document_type
          docDate,                              // $10: document_date (converted to DATE format)
          department || '',                     // $11: department
          owner || '',                          // $12: owner
          classification_level || 'Unclassified' // $13: classification_level
        ]
      );

      console.log("✅ File saved to database with ID:", result.rows[0].id);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: result.rows[0],
          downloadUrl: `/uploads/${req.file.filename}`
        }
      });

    } catch (error) {
      console.error('❌ Upload database error:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving file to database',
        error: error.message
      });
    }
  },

  getUserFiles: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10, sort = 'newest', department, classification } = req.query;
      const offset = (page - 1) * limit;

      let sortQuery = 'ORDER BY uploaded_at DESC';
      if (sort === 'oldest') sortQuery = 'ORDER BY uploaded_at ASC';
      if (sort === 'name') sortQuery = 'ORDER BY original_name ASC';
      if (sort === 'size') sortQuery = 'ORDER BY file_size DESC';
      if (sort === 'type') sortQuery = 'ORDER BY document_type ASC';

      let whereClause = 'WHERE f.user_id = $1';
      const params = [userId];
      let paramCount = 1;

      if (department) {
        paramCount++;
        whereClause += ` AND f.department = $${paramCount}`;
        params.push(department);
      }

      if (classification) {
        paramCount++;
        whereClause += ` AND f.classification_level = $${paramCount}`;
        params.push(classification);
      }

      // Get files
      const filesResult = await query(
        `SELECT f.*, 
                u.name as user_name,
                u.email as user_email
         FROM files f
         LEFT JOIN users u ON f.user_id = u.id
         ${whereClause}
         ${sortQuery}
         LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
        [...params, limit, offset]
      );

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) FROM files f ${whereClause}`,
        params
      );

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          files: filesResult.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalFiles: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching files'
      });
    }
  },

  deleteFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId;

      // Check if file exists and belongs to user
      const fileResult = await query(
        'SELECT * FROM files WHERE id = $1 AND user_id = $2',
        [fileId, userId]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
      }

      const file = fileResult.rows[0];

      // Delete from filesystem
      try {
        fs.unlinkSync(file.filepath);
      } catch (fsError) {
        console.warn('Could not delete file from filesystem:', fsError.message);
      }

      // Delete from database
      await query('DELETE FROM files WHERE id = $1', [fileId]);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file'
      });
    }
  },

  updateFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId;
      const { 
        description, 
        isPublic,
        document_type,
        document_date,
        department,
        owner,
        classification_level
      } = req.body;

      // Prepare date for database
      const docDate = document_date ? new Date(document_date).toISOString().split('T')[0] : null;

      const result = await query(
        `UPDATE files 
         SET description = $1, 
             is_public = $2,
             document_type = $3,
             document_date = $4,
             department = $5,
             owner = $6,
             classification_level = $7,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 AND user_id = $9
         RETURNING *`,
        [
          description,
          isPublic === 'true',
          document_type || '',
          docDate,
          department || '',
          owner || '',
          classification_level || 'Unclassified',
          fileId,
          userId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'File updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating file'
      });
    }
  },

  getFileDetails: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId;

      const result = await query(
        `SELECT f.*, 
                u.name as user_name,
                u.email as user_email
         FROM files f
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.id = $1 AND (f.user_id = $2 OR f.is_public = true)`,
        [fileId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get file details error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching file details'
      });
    }
  },

  downloadFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.userId;

      const result = await query(
        'SELECT * FROM files WHERE id = $1 AND (user_id = $2 OR is_public = true)',
        [fileId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
      }

      const file = result.rows[0];

      // Check if file exists on disk
      if (!fs.existsSync(file.filepath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      res.download(file.filepath, file.original_name);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file'
      });
    }
  },

  getDepartments: async (req, res) => {
    try {
      const result = await query(
        'SELECT DISTINCT department FROM files WHERE department IS NOT NULL AND department != \'\' ORDER BY department'
      );

      res.json({
        success: true,
        data: result.rows.map(row => row.department)
      });
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching departments'
      });
    }
  },

  getFileStats: async (req, res) => {
    try {
      const userId = req.user.userId;

      // Get total files count
      const totalResult = await query(
        'SELECT COUNT(*) as total FROM files WHERE user_id = $1',
        [userId]
      );

      // Get total storage used
      const storageResult = await query(
        'SELECT COALESCE(SUM(file_size), 0) as total_storage FROM files WHERE user_id = $1',
        [userId]
      );

      // Get files by type
      const typeResult = await query(
        `SELECT document_type, COUNT(*) as count 
         FROM files 
         WHERE user_id = $1 AND document_type IS NOT NULL AND document_type != ''
         GROUP BY document_type
         ORDER BY count DESC`,
        [userId]
      );

      // Get recent uploads
      const recentResult = await query(
        `SELECT id, original_name, uploaded_at 
         FROM files 
         WHERE user_id = $1 
         ORDER BY uploaded_at DESC 
         LIMIT 5`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          totalFiles: parseInt(totalResult.rows[0].total),
          totalStorage: parseInt(storageResult.rows[0].total_storage),
          filesByType: typeResult.rows,
          recentUploads: recentResult.rows
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching file statistics'
      });
    }
  }
};
export const uploadFiles = uploadController.uploadFile;
export const getFiles = uploadController.getFiles;*/






/*
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../config/db.js';

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Controller functions
export const uploadController = {
  uploadFile: async (req, res) => {
    try {
      console.log('📤 Upload request');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const { 
        description = '', 
        isPublic = 'false',
        document_type = '',
        document_date,
        department = '',
        owner = '',
        classification_level = 'Unclassified'
      } = req.body;
      
      // Insert into database
      const result = await query(
        `INSERT INTO files (
          filename, filepath, filetype, original_name, file_size,
          user_id, description, is_public, document_type, document_date,
          department, owner, classification_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING *`,
        [
          req.file.filename,
          req.file.path,
          req.file.mimetype,
          req.file.originalname,
          req.file.size,
          req.user.userId,
          description,
          isPublic === 'true',
          document_type,
          document_date,
          department,
          owner,
          classification_level
        ]
      );
      
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: result.rows[0],
          downloadUrl: `/uploads/${req.file.filename}`
        }
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed'
      });
    }
  },
  
  getUserFiles: async (req, res) => {
    try {
      const result = await query(
        'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
        [req.user.userId]
      );
      
      res.json({
        success: true,
        files: result.rows
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get files'
      });
    }
  },
  
  getFileDetails: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'SELECT * FROM files WHERE id = $1 AND user_id = $2',
        [id, req.user.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      res.json({
        success: true,
        file: result.rows[0]
      });
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file'
      });
    }
  },
  
  downloadFile: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await query(
        'SELECT * FROM files WHERE id = $1 AND user_id = $2',
        [id, req.user.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      const file = result.rows[0];
      
      if (!fs.existsSync(file.filepath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }
      
      res.download(file.filepath, file.original_name);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download file'
      });
    }
  },
  
  updateFile: async (req, res) => {
    try {
      const { id } = req.params;
      const { description, isPublic, document_type, department, owner, classification_level } = req.body;
      
      const result = await query(
        `UPDATE files 
         SET description = $1, is_public = $2, document_type = $3, 
             department = $4, owner = $5, classification_level = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [description, isPublic, document_type, department, owner, classification_level, id, req.user.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      res.json({
        success: true,
        message: 'File updated successfully',
        file: result.rows[0]
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update file'
      });
    }
  },
  
  deleteFile: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get file info first
      const fileResult = await query(
        'SELECT * FROM files WHERE id = $1 AND user_id = $2',
        [id, req.user.userId]
      );
      
      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      const file = fileResult.rows[0];
      
      // Delete from filesystem
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      
      // Delete from database
      await query('DELETE FROM files WHERE id = $1', [id]);
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  }
};
/*


















*/


// controllers/uploadControllers.js - CORRECTED VERSION
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../config/db.js';

// =========== MULTER CONFIGURATION ===========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

export const uploadMiddleware = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// =========== CONTROLLER FUNCTIONS ===========

// Get all files for user (rename to getFiles)
export const getFiles = async (req, res) => {
  try {
    console.log('📂 GET /api/upload - Fetching files for user:', req.user.userId);
    
    const result = await query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [req.user.userId]
    );
    
    console.log(`✅ Found ${result.rows.length} files for user ${req.user.userId}`);
    
    res.json({
      success: true,
      files: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/*
export const getPublicFiles = async (req, res) => {
  try {
    console.log('📂 GET /api/upload/public - Fetching public files');
    
    // Parse and validate query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const owner = req.query.owner || '';
    
    // Calculate offset safely
    const offset = Math.max(0, (page - 1) * limit);
    
    console.log('Query params:', { page, limit, offset, search, owner });
    

    
    // Add search conditions
    const conditions = ['f.is_public = true', 'f.user_id != $1'];
    const params = [req.user.userId];
    let paramCount = 1;
    
    if (search) {
      paramCount++;
      conditions.push(`(f.original_name ILIKE $${paramCount} OR f.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }
    
    if (owner) {
      paramCount++;
      conditions.push(`u.name ILIKE $${paramCount}`);
      params.push(`%${owner}%`);
    }
    
  
    
  
   const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    // COUNT query - NO ORDER BY in COUNT!
    const countQuery = `
      SELECT COUNT(*) as total
      FROM files f
      LEFT JOIN users u ON f.user_id = u.id
      ${whereClause}
    `;
    
    console.log('Count query:', countQuery);
    console.log('Count params:', params);
    
    const countResult = await query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total);
    // MAIN query with ORDER BY and pagination
    paramCount++;
    const mainQuery = `
      SELECT f.*, u.name as owner_name, u.email as owner_email
      FROM files f
      LEFT JOIN users u ON f.user_id = u.id
      ${whereClause}
      ORDER BY f.uploaded_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    const mainParams = [...params, parseInt(limit), parseInt(offset)];
    
    console.log('Main query:', mainQuery);
    console.log('Main params:', mainParams);
    console.log('Param types:', mainParams.map(p => `${p} (${typeof p})`));
    
    const result = await query(mainQuery, mainParams);
    
    console.log(`✅ Found ${result.rows.length} public files (total: ${totalCount})`);
    
    res.json({
      success: true,
      data: {
        files: result.rows,
        pagination: {
          totalFiles: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit: limit
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching public files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};*/



// Get all public files - SIMPLE AND RELIABLE VERSION
/*export const getPublicFiles = async (req, res) => {
  try {
    console.log('📂 GET /api/upload/public - Simple reliable version');
    
    // Parse parameters with defaults
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const owner = req.query.owner || '';
    
    console.log('Parameters:', { page, limit, offset, search, owner });
    
    // Start building queries
    let baseQuery = `
      FROM files f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.is_public = true 
      AND f.user_id != $1
    `;
    
    let params = [req.user.userId];
    let paramCounter = 1;
    
    // Add search condition
    if (search) {
      paramCounter++;
      baseQuery += ` AND (f.original_name ILIKE $${paramCounter} OR f.description ILIKE $${paramCounter})`;
      params.push(`%${search}%`);
    }
    
    // Add owner condition
    if (owner) {
      paramCounter++;
      baseQuery += ` AND u.name ILIKE $${paramCounter}`;
      params.push(`%${owner}%`);
    }
    
    // COUNT query
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    console.log('Count query:', countQuery);
    console.log('Count params:', params);
    
    const countResult = await query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total);
    
    // MAIN query
    paramCounter++;
    const limitParam = paramCounter;
    paramCounter++;
    const offsetParam = paramCounter;
    
    const mainQuery = `
      SELECT f.*, u.name as owner_name, u.email as owner_email 
      ${baseQuery}
      ORDER BY f.uploaded_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    
    const mainParams = [...params, limit, offset];
    
    console.log('Main query:', mainQuery);
    console.log('Main params:', mainParams);
    console.log('Total params needed:', paramCounter);
    console.log('Params provided:', mainParams.length);
    
    const result = await query(mainQuery, mainParams);
    
    console.log(`✅ Success! Found ${result.rows.length} files`);
    
    res.json({
      success: true,
      data: {
        files: result.rows,
        pagination: {
          totalFiles: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit: limit
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getPublicFiles:', error.message);
    
    // Ultra simple fallback
    try {
      console.log('🔄 Trying ultra-simple fallback...');
      
      const fallbackResult = await query(
        `SELECT f.*, u.name as owner_name, u.email as owner_email
         FROM files f
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.is_public = true AND f.user_id != $1
         ORDER BY f.uploaded_at DESC
         LIMIT 20`,
        [req.user.userId]
      );
      
      res.json({
        success: true,
        data: {
          files: fallbackResult.rows,
          pagination: {
            totalFiles: fallbackResult.rows.length,
            totalPages: 1,
            currentPage: 1,
            limit: 20
          }
        }
      });
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: 'Internal server error'
      });
    }
  }
};*/


export const getPublicFiles = async (req, res) => {
  try {
    console.log('📂 GET /api/upload/public - Fixed for your table structure');
    
    // Parse parameters with defaults
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const ownerFilter = req.query.owner || '';
    
    console.log('Parameters:', { page, limit, offset, search, ownerFilter });
    
    // Build WHERE conditions separately
    let whereConditions = ['f.is_public = true', 'f.user_id != $1'];
    let params = [req.user.userId];
    let paramCounter = 1;
    
    // Add search condition
    if (search) {
      paramCounter++;
      whereConditions.push(`(f.original_name ILIKE $${paramCounter} OR f.description ILIKE $${paramCounter})`);
      params.push(`%${search}%`);
    }
    
    // Add owner filter - uses the "owner" column in files table
    if (ownerFilter) {
      paramCounter++;
      whereConditions.push(`f.owner ILIKE $${paramCounter}`);
      params.push(`%${ownerFilter}%`);
    }
    
    // Build WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // COUNT query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM files f
      ${whereClause}
    `;
    console.log('Count query:', countQuery);
    
    const countResult = await query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total);
    
    // MAIN query - Select all columns plus owner info
    paramCounter++;
    const limitParam = paramCounter;
    paramCounter++;
    const offsetParam = paramCounter;
    
    const mainQuery = `
      SELECT 
        f.id,
        f.filename,
        f.filepath,
        f.filetype,
        f.original_name,
        f.file_size,
        f.user_id,
        f.description,
        f.is_public,
        f.document_type,
        f.document_date,
        f.department,
        f.owner as owner_name,
        f.classification_level,
        f.uploaded_at,
        f.updated_at,
        f.public_since,
        COALESCE(u.email, 'No email available') as owner_email
      FROM files f
      LEFT JOIN users u ON f.user_id = u.id
      ${whereClause}
      ORDER BY f.uploaded_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    
    const mainParams = [...params, limit, offset];
    
    console.log('Main query:', mainQuery);
    
    const result = await query(mainQuery, mainParams);
    
    console.log(`✅ Success! Found ${result.rows.length} files`);
    console.log('First file raw:', result.rows[0]);
    
    // Format the response for frontend
    const formattedFiles = result.rows.map(file => ({
      id: file.id,
      original_name: file.original_name,
      filename: file.filename,
      description: file.description,
      file_size: file.file_size,
      file_type: file.filetype,
      filepath: file.filepath,
      user_id: file.user_id,
      owner_name: file.owner_name,
      owner_email: file.owner_email,
      created_at: file.uploaded_at,
      uploaded_at: file.uploaded_at,
      updated_at: file.updated_at,
      public_since: file.public_since,
      is_public: file.is_public,
      document_type: file.document_type,
      document_date: file.document_date,
      department: file.department,
      classification_level: file.classification_level
    }));
    
    console.log('First file formatted:', formattedFiles[0]);
    
    res.json({
      success: true,
      data: {
        files: formattedFiles,
        pagination: {
          totalFiles: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit: limit
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getPublicFiles:', error.message);
    console.error('Full error:', error);
    
    // Fallback without JOIN (simpler query)
    try {
      console.log('🔄 Trying fallback without JOIN...');
      
      // Build fallback WHERE conditions
      let fallbackConditions = ['is_public = true', 'user_id != $1'];
      let fallbackParams = [req.user.userId];
      let fallbackParamCounter = 1;
      
      if (search) {
        fallbackParamCounter++;
        fallbackConditions.push(`(original_name ILIKE $${fallbackParamCounter} OR description ILIKE $${fallbackParamCounter})`);
        fallbackParams.push(`%${search}%`);
      }
      
      if (ownerFilter) {
        fallbackParamCounter++;
        fallbackConditions.push(`owner ILIKE $${fallbackParamCounter}`);
        fallbackParams.push(`%${ownerFilter}%`);
      }
      
      const fallbackWhereClause = fallbackConditions.length > 0 ? `WHERE ${fallbackConditions.join(' AND ')}` : '';
      
      const fallbackQuery = `
        SELECT 
          id,
          filename,
          filepath,
          filetype,
          original_name,
          description,
          file_size,
          user_id,
          owner as owner_name,
          uploaded_at,
          public_since,
          is_public,
          document_type,
          document_date,
          department,
          classification_level
        FROM files 
        ${fallbackWhereClause}
        ORDER BY uploaded_at DESC
        LIMIT $${fallbackParams.length + 1} OFFSET $${fallbackParams.length + 2}
      `;
      
      const fallbackMainParams = [...fallbackParams, limit, offset];
      
      const fallbackResult = await query(fallbackQuery, fallbackMainParams);
      
      const fallbackFiles = fallbackResult.rows.map(file => ({
        id: file.id,
        original_name: file.original_name,
        filename: file.filename,
        description: file.description,
        file_size: file.file_size,
        file_type: file.filetype,
        filepath: file.filepath,
        user_id: file.user_id,
        owner_name: file.owner_name,
        owner_email: 'No email available',
        created_at: file.uploaded_at,
        uploaded_at: file.uploaded_at,
        public_since: file.public_since,
        is_public: file.is_public,
        document_type: file.document_type,
        document_date: file.document_date,
        department: file.department,
        classification_level: file.classification_level
      }));
      
      res.json({
        success: true,
        data: {
          files: fallbackFiles,
          pagination: {
            totalFiles: fallbackFiles.length,
            totalPages: Math.ceil(fallbackFiles.length / limit),
            currentPage: page,
            limit: limit
          }
        }
      });
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: error.message
      });
    }
  }
};





// Upload file
export const uploadFile = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    if (!req.files || req.files.length === 0) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const uploadedFiles = [];
    const errors = [];
    
    
    
    const { 
      description = '', 
      is_public = 'false',
      document_type = '',
      document_date = new Date().toISOString().split('T')[0],
      department = '',
      owner = '',
      classification_level = 'Unclassified'
    } = req.body;
    
    console.log('📝 Metadata:', { description, document_type, department });
    
    
    for (const file of req.files) {
      try {
        console.log(`📄 Processing file: ${file.originalname} (${file.size} bytes)`);
    /*const isPublicBool = isPublic === 'true' || isPublic === true;
    const publicSince = isPublicBool ? new Date().toISOString() : null;*/
    
    // Insert into database
    const result = await query(
      `INSERT INTO files (
        filename, filepath, filetype, original_name, file_size,
        user_id, description, is_public, document_type, document_date,
        department, owner, classification_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
      file.filename,
        `uploads/${file.filename}`,
        file.mimetype,
        file.originalname,
        file.size,
        req.user.userId,
        description,
        is_public === 'true',
        document_type,
        document_date,
        department,
        owner || req.user.name,
        classification_level
      ]
    );
    
    const uploadedFile = result.rows[0];
    console.log('✅ File uploaded successfully:', uploadedFile.id);
    
    const formattedFile = {
          id: uploadedFile.id,
          filename: uploadedFile.filename,
          original_name: uploadedFile.original_name,
          file_size: uploadedFile.file_size,
          file_type: uploadedFile.filetype,
          is_public: uploadedFile.is_public,
          uploaded_at: uploadedFile.uploaded_at,
          // Add other fields your frontend might need
          description: uploadedFile.description,
          document_type: uploadedFile.document_type,
          department: uploadedFile.department,
          classification_level: uploadedFile.classification_level
        };
        uploadedFiles.push(formattedFile);
        console.log(`✅ File saved: ${uploadedFile.original_name} (ID: ${uploadedFile.id})`);
    


} catch (fileError) {
        console.error(`❌ Error uploading file ${file.originalname}:`, fileError);
        errors.push({
          filename: file.originalname,
          error: fileError.message
        });
      }
    }
    
    if (uploadedFiles.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'All files failed to upload',
        errors: errors
      });
    }
    
    
    let message;
    if (uploadedFiles.length === 1) {
      message = 'File uploaded successfully';
    } else {
      message = `${uploadedFiles.length} files uploaded successfully`;
      if (errors.length > 0) {
        message += `, ${errors.length} failed`;
      }
    }
    
   const response = {
      success: true,
      message: message,
      data: {
        file: uploadedFiles[0], // First file for compatibility
        files: uploadedFiles    // All files
      },
      count: {
        total: req.files.length,
        success: uploadedFiles.length,
        failed: errors.length
      }
    };
    
    
    
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: uploadedFile,
      downloadUrl: `/uploads/${req.file.filename}`
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const toggleFileVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;
    
    console.log(`🔄 Toggle visibility for file ${id}: is_public = ${is_public}`);
    
    // Validate input
    if (typeof is_public !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_public must be a boolean value'
      });
    }
    
    // First check if file exists
    const checkResult = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found or you do not have permission'
      });
    }
    
    // Update visibility
    const updateResult = await query(
      `UPDATE files 
       SET is_public = $1, 
           public_since = CASE WHEN $1 = true THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [is_public, id, req.user.userId]
    );
    
    console.log(`✅ File ${id} visibility updated to: ${is_public}`);
    
    res.json({
      success: true,
      message: is_public ? 'File is now public' : 'File is now private',
      data: {
        file: updateResult.rows[0]
      }
    });
    
  } catch (error) {
    console.error('❌ Error toggling file visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update file visibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get file visibility status - NEW FUNCTION
export const getFileVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`👁️ Get visibility for file ${id}`);
    
    const result = await query(
      'SELECT id, is_public, public_since, user_id FROM files WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = result.rows[0];
    
    // Check ownership
    const isOwner = file.user_id === req.user.userId;
    
    res.json({
      success: true,
      data: {
        id: file.id,
        is_public: file.is_public,
        public_since: file.public_since,
        can_toggle: isOwner
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting file visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file visibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};







    
    

// Download file
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    /*const result = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = result.rows[0];
    const filePath = path.join(process.cwd(), file.filepath);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    res.download(filePath, file.original_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
};*/

const fileResult = await query('SELECT * FROM files WHERE id = $1', [id]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = fileResult.rows[0];
    
    // Check permissions: either owner OR file is public
    if (file.user_id !== req.user.userId && !file.is_public) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const filePath = path.join(process.cwd(), file.filepath);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    res.download(filePath, file.original_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
};


// Update file
export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, is_public, document_type, department, owner, classification_level } = req.body;
    
    const result = await query(
      `UPDATE files 
       SET description = $1, is_public = $2, document_type = $3, 
           department = $4, owner = $5, classification_level = $6,
           updated_at = CURRENT_TIMESTAMP
           
          public_since = CASE WHEN $2 = true AND public_since IS NULL THEN NOW() ELSE public_since END 
           
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [description, is_public, document_type, department, owner, classification_level, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    res.json({
      success: true,
      message: 'File updated successfully',
      file: result.rows[0]
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update file'
    });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file info first
    const fileResult = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = fileResult.rows[0];
    const filePath = path.join(process.cwd(), file.filepath);
    
    // Delete from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await query('DELETE FROM files WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};

// Additional endpoints for MyFiles page
export const getFileStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get total files and storage
    const statsResult = await query(
      `SELECT COUNT(*) as total_files, COALESCE(SUM(file_size::bigint), 0) as total_storage 
       FROM files WHERE user_id = $1`,
      [userId]
    );
    
    // Get files by type
    const typeResult = await query(
      `SELECT document_type, COUNT(*) as count 
       FROM files WHERE user_id = $1 AND document_type IS NOT NULL 
       GROUP BY document_type`,
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        totalFiles: parseInt(statsResult.rows[0].total_files),
        totalStorage: parseInt(statsResult.rows[0].total_storage || 0),
        filesByType: typeResult.rows
      }
    });
  } catch (error) {
    console.error('Error in stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const deptResult = await query(
      `SELECT DISTINCT department FROM files 
       WHERE user_id = $1 AND department IS NOT NULL AND department != '' 
       ORDER BY department`,
      [userId]
    );
    
    const departments = deptResult.rows.map(row => row.department);
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error in departments:', error);
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
};


export const getSharedWithMe = async (req, res) => {
  try {
    console.log('📂 GET /api/upload/shared - Files shared with user:', req.user.userId);
    
    const result = await query(
      `SELECT f.*, u.name as owner_name, u.email as owner_email
       FROM files f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.is_public = true 
       AND f.user_id != $1
       ORDER BY f.created_at DESC`,
      [req.user.userId]
    );
    
    console.log(`✅ Found ${result.rows.length} files shared with user ${req.user.userId}`);
    
    res.json({
      success: true,
      files: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching shared files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// Default export for backward compatibility
export default {
  /*
  getFiles,
  uploadFile,
  getFileDetails,
  downloadFile,
  updateFile,
  deleteFile,
  getFileStats,
  getDepartments*/
  
  getFiles,
  getPublicFiles,
  uploadFile,
  toggleFileVisibility,
  getFileVisibility,
  getFileDetails,
  downloadFile,
  updateFile,
  deleteFile,
  getFileStats,
  getDepartments,
  getSharedWithMe
};