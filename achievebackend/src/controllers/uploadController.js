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





// controllers/uploadControllers.js
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















