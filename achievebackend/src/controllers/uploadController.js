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
};

export const uploadFiles = uploadController.uploadFile;
export const getFiles = uploadController.getFiles;