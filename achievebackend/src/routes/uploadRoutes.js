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


/* 1st fall back on

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

export default router;*/








// routes/uploadRoutes.js
/*fall back oon
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  next(err);
};

// =========== TEST ENDPOINTS (no auth) ===========
// Simple test endpoint
router.get('/test', (req, res) => {
  console.log('✅ GET /api/upload/test hit');
  res.json({
    success: true,
    message: 'Upload API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      upload: 'POST /api/upload',
      test: 'GET /api/upload/test',
      health: 'GET /health'
    }
  });
});

// Echo endpoint for debugging
router.post('/echo', upload.single('file'), (req, res) => {
  console.log('✅ POST /api/upload/echo hit');
  console.log('File:', req.file);
  console.log('Body:', req.body);
  
  res.json({
    success: true,
    message: 'Echo received',
    file: req.file ? {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      filename: req.file.filename
    } : null,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// =========== MAIN UPLOAD ENDPOINT (with auth) ===========
router.post('/', 
  authenticate, 
  upload.single('file'),
  handleMulterError,
  async (req, res, next) => {
    try {
      console.log('✅ POST /api/upload hit');
      console.log('User:', req.user);
      console.log('File:', req.file);
      console.log('Body:', req.body);
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
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
      
      // Convert document_date
      let docDate = null;
      if (document_date) {
        try {
          const date = new Date(document_date);
          if (!isNaN(date.getTime())) {
            docDate = date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Date parse error:', error.message);
        }
      }
      
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
          docDate,
          department,
          owner,
          classification_level
        ]
      );
      
      console.log('✅ File saved to database, ID:', result.rows[0].id);
      
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: result.rows[0],
          downloadUrl: `/uploads/${req.file.filename}`
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Clean up uploaded file if database insert failed
      if (req.file && req.file.path) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('🧹 Cleaned up file:', req.file.path);
          }
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError.message);
        }
      }
      
      // Pass error to global error handler
      next(error);
    }
  }
);

// =========== OTHER FILE ROUTES (with auth) ===========
// Get user files
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );
    
    res.json({
      success: true,
      files: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    next(error);
  }
});

// Route-specific error handler (catches errors from above routes)
router.use((err, req, res, next) => {
  console.error('Upload route error:', err);
  
  // Always return JSON for API errors
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'File operation failed',
    timestamp: new Date().toISOString()
  });
});

export default router;*/





/*
import express from 'express';
import { 
  uploadController,
  upload 
} from '../controllers/uploadController.js'; // Added 's'
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test endpoint
/*
router.get('/test', (req, res) => {
  console.log('✅ GET /api/upload/test');
  res.json({
    success: true,
    message: 'Upload routes are working',
    timestamp: new Date().toISOString()
  });
});*/


/*
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📂 GET /api/upload - Fetching files for user:', req.user.userId);
    
    const result = await query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [req.user.userId]
    );
    
    console.log(`✅ Found ${result.rows.length} files for user ${req.user.userId}`);
    
    // Format dates for frontend
    const files = result.rows.map(file => ({
      ...file,
      uploaded_at: new Date(file.uploaded_at).toISOString(),
      document_date: file.document_date ? new Date(file.document_date).toISOString().split('T')[0] : null
    }));
    
    res.json({
      success: true,
      files: files,
      count: files.length,
      user: {
        id: req.user.userId,
        name: req.user.name
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});*/

// Upload file (with authentication)

/*
router.post('/',
  authenticate,
  upload.single('file'),
  uploadController.uploadFile
);

// Get user files

router.get('/', authenticate, uploadController.getUserFiles);

// Get single file
router.get('/:id', authenticate, uploadController.getFileDetails);

// Download file
router.get('/:id/download', authenticate, uploadController.downloadFile);

// Update file
router.put('/:id', authenticate, uploadController.updateFile);

// Delete file
router.delete('/:id', authenticate, uploadController.deleteFile);


// =========== ADDITIONAL ENDPOINTS ===========
// Add these endpoints that your frontend expects
router.get('/my-files', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', department, classification } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;
    
    // Build base query
    let baseQuery = 'SELECT * FROM files WHERE user_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM files WHERE user_id = $1';
    const queryParams = [userId];
    let paramCount = 1;
    
    // Add filters
    if (department) {
      paramCount++;
      baseQuery += ` AND department = $${paramCount}`;
      countQuery += ` AND department = $${paramCount}`;
      queryParams.push(department);
    }
    
    if (classification) {
      paramCount++;
      baseQuery += ` AND classification_level = $${paramCount}`;
      countQuery += ` AND classification_level = $${paramCount}`;
      queryParams.push(classification);
    }
    
    // Add sorting
    switch(sort) {
      case 'newest':
        baseQuery += ' ORDER BY uploaded_at DESC';
        break;
      case 'oldest':
        baseQuery += ' ORDER BY uploaded_at ASC';
        break;
      case 'name':
        baseQuery += ' ORDER BY original_name ASC';
        break;
      case 'size':
        baseQuery += ' ORDER BY file_size DESC';
        break;
      case 'type':
        baseQuery += ' ORDER BY document_type ASC';
        break;
      default:
        baseQuery += ' ORDER BY uploaded_at DESC';
    }
    
    // Add pagination
    paramCount++;
    baseQuery += ` LIMIT $${paramCount}`;
    queryParams.push(parseInt(limit));
    
    paramCount++;
    baseQuery += ` OFFSET $${paramCount}`;
    queryParams.push(offset);
    
    // Execute queries
    const [filesResult, countResult] = await Promise.all([
      query(baseQuery, queryParams.slice(0, -2)), // Remove LIMIT/OFFSET for count
      query(countQuery, queryParams.slice(0, -2))
    ]);
    
    const totalFiles = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: {
        files: filesResult.rows,
        pagination: {
          totalFiles,
          totalPages: Math.ceil(totalFiles / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error in my-files:', error);
    res.status(500).json({ success: false, message: 'Error fetching files' });
  }
});

// Stats endpoint
router.get('/stats/summary', authenticate, async (req, res) => {
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
});

// Departments endpoint
router.get('/departments/list', authenticate, async (req, res) => {
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
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Upload routes are healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;*/





// routes/uploadRoutes.js - UPDATED
import express from 'express';
import { 
  getFiles, 
  uploadFile, 
  getFileDetails,
  downloadFile,
  updateFile,
  deleteFile,
  getFileStats,
  getDepartments,
  getPublicFiles,          // NEW
  toggleFileVisibility,    // NEW
  getFileVisibility,       // NEW
  getSharedWithMe
} from '../controllers/uploadController.js'; // Named imports
import { authenticate } from '../middleware/authMiddleware.js';
import  uploadMiddleware  from '../middleware/uploadMiddleware.js'; // Import multer middleware

const router = express.Router();

// =========== BASIC ROUTES ===========
router.get('/', authenticate, getFiles);
router.post('/', authenticate, uploadMiddleware.single('file'), uploadFile);
router.get('/:id', authenticate, getFileDetails);
router.get('/:id/download', authenticate, downloadFile);
router.put('/:id', authenticate, updateFile);
router.delete('/:id', authenticate, deleteFile);

// =========== MYFILES PAGE ROUTES ===========
router.get('/my-files', authenticate, getFiles); // Reuse getFiles with pagination
router.get('/stats/summary', authenticate, getFileStats);
router.get('/departments/list', authenticate, getDepartments);


// NEW ROUTES for public files functionality
router.get('/public', authenticate, getPublicFiles);           // Get all public files
router.get('/shared', authenticate, getSharedWithMe);         // Files shared with me
router.put('/:id/visibility', authenticate, toggleFileVisibility);  // Toggle public/private
router.get('/:id/visibility', authenticate, getFileVisibility);     // Check visibility status


// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Upload routes working' });
});




export default router;