/*import express from 'express';
import { uploadController, upload } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// File upload with metadata
router.post('/', authenticate, upload.single('file'), uploadController.uploadFile);

// Get user's files
router.get('/my-files', authenticate, uploadController.getUserFiles);

// File operations
router.get('/:fileId', authenticate, uploadController.getFileDetails);
router.delete('/:fileId', authenticate, uploadController.deleteFile);
router.put('/:fileId', authenticate, uploadController.updateFile);
router.get('/:fileId/download', authenticate, uploadController.downloadFile);

// Additional endpoints
router.get('/stats/summary', authenticate, uploadController.getFileStats);
router.get('/departments/list', authenticate, uploadController.getDepartments);

export default router;*/



// src/routes/uploadRoutes.js
/*import express from 'express';
import { uploadController, upload } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.post('/', authenticate, upload.single('file'), uploadController.uploadFile);
router.get('/my-files', authenticate, uploadController.getUserFiles);
router.get('/shared', authenticate, uploadController.getSharedFiles);
router.delete('/:fileId', authenticate, uploadController.deleteFile);
router.put('/:fileId', authenticate, uploadController.updateFile);
router.post('/:fileId/share', authenticate, uploadController.shareFile);

export default router;*/












/*import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadFiles } from "../controllers/uploadController.js";

const router = express.Router();

// Accept multiple files, but will also work if only one is selected
router.post("/documents/upload", upload.array("files", 10), uploadFiles);

export default router;*/

/*fall back on
import express from 'express';
import multer from 'multer';
import path from 'path';
//import pool from '../db.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await pool.query(
      'INSERT INTO files (user_id, filename, file_path, file_size, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, file.originalname, file.path, file.size, file.mimetype]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      file: result.rows[0]
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get user files
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );

    res.json({
      files: result.rows
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Delete file
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const result = await pool.query(
      'DELETE FROM files WHERE id = $1 RETURNING *',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      message: 'File deleted successfully',
      file: result.rows[0]
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;*/




import express from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { upload } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// =========== FILE UPLOAD ROUTES ===========

// Upload file (single file upload)
router.post('/upload', 
  upload.single('file'),
  uploadController.uploadFile
);

// Get all files for authenticated user with pagination and filters
router.get('/', uploadController.getUserFiles);

// Get file details by ID
router.get('/:fileId', uploadController.getFileDetails);

// Download file
router.get('/:fileId/download', uploadController.downloadFile);

// Update file metadata
router.put('/:fileId', uploadController.updateFile);

// Delete file
router.delete('/:fileId', uploadController.deleteFile);

// =========== STATISTICS & META ROUTES ===========

// Get available departments
router.get('/meta/departments', uploadController.getDepartments);

// Get file statistics
router.get('/stats/summary', uploadController.getFileStats);

// =========== DEBUG & TEST ROUTES ===========

// Test database connection and upload functionality
router.get('/debug/test', async (req, res) => {
  try {
    console.log("🧪 DEBUG ROUTE - Testing upload system");
    console.log("Authenticated user:", req.user);
    
    // Return system info
    res.json({
      success: true,
      message: 'Upload system is operational',
      system: {
        timestamp: new Date().toISOString(),
        user: {
          id: req.user.userId,
          email: req.user.email
        },
        endpoints: {
          upload: 'POST /api/files/upload',
          listFiles: 'GET /api/files/',
          getFile: 'GET /api/files/:id',
          download: 'GET /api/files/:id/download',
          update: 'PUT /api/files/:id',
          delete: 'DELETE /api/files/:id',
          departments: 'GET /api/files/meta/departments',
          stats: 'GET /api/files/stats/summary'
        }
      }
    });
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test file upload endpoint (simulated)
router.post('/test-upload', authenticate, async (req, res) => {
  try {
    const { query } = await import('../config/db.js');
    
    // Create a test file record
    const testInsert = await query(
      `INSERT INTO files (
        filename, filepath, filetype, original_name, file_size,
        user_id, description, is_public, document_type, document_date,
        department, owner, classification_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, filename, original_name, uploaded_at`,
      [
        'test-' + Date.now() + '.txt',
        'uploads/test-file.txt',
        'text/plain',
        'Test File.txt',
        1024,
        req.user.userId,
        'Database test from API route',
        true,
        'Test Document',
        new Date().toISOString().split('T')[0],
        'IT',
        'System',
        'Unclassified'
      ]
    );
    
    res.json({ 
      success: true, 
      message: 'Test upload successful (database only)',
      file: testInsert.rows[0]
    });
  } catch (error) {
    console.error("Test upload error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error 
    });
  }
});

// Handle multer errors globally
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  next(err);
};

// Apply multer error handler
router.use(handleMulterError);

export default router;