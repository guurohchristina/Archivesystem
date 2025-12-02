// src/routes/uploadRoutes.js
import express from 'express';
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

export default router;












/*import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadFiles } from "../controllers/uploadController.js";

const router = express.Router();

// Accept multiple files, but will also work if only one is selected
router.post("/documents/upload", upload.array("files", 10), uploadFiles);

export default router;*/


/*import express from 'express';
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