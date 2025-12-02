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


// src/controllers/uploadController.js
/*
import { FileModel } from '../models/File.js';

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
};
export const uploadFiles = uploadController.uploadFile;
export const getFiles = uploadController.getFiles;





