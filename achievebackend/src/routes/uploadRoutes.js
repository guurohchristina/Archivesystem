import express from 'express';

import { 

  uploadFile, 

  downloadFile,
  updateFile,
  deleteFile,
  getFileStats,
  getDepartments,
  getPublicFiles,          // NEW
  toggleFileVisibility,    // NEW
  getFileVisibility,       // NEW
  getSharedWithMe,
  getCategoryCounts,
  
  // NEW FOLDER FUNCTIONS
  getUserFiles,           // Get files with folder support
  getAllUserItems,        // Get files + folders
  moveFile,              // Move file between folders
  searchItems            // Search files and folders
  
} from '../controllers/uploadController.js'; // Named imports
import { authenticate } from '../middleware/authMiddleware.js';
import  uploadMiddleware  from '../middleware/uploadMiddleware.js'; // Import multer middleware

const router = express.Router();

// =========== FOLDER MANAGEMENT ROUTES ===========
// Get user files with folder support (supports folder_id query parameter)
router.get('/user', authenticate, getUserFiles);

// Get all user items (files + folders) for a specific folder
router.get('/items', authenticate, getAllUserItems);

// Move file to different folder
router.put('/:id/move', authenticate, moveFile);

// Search files and folders
router.get('/search', authenticate, searchItems);

// =========== PUBLIC FILES ROUTES ===========
router.get('/public', authenticate, getPublicFiles);           // Get all public files
router.get('/shared', authenticate, getSharedWithMe);         // Files shared with me

// =========== FILE VISIBILITY ROUTES ===========
router.put('/:id/visibility', authenticate, toggleFileVisibility);  // Toggle public/private
router.get('/:id/visibility', authenticate, getFileVisibility);     // Check visibility status

// =========== BASIC FILE ROUTES ===========
router.get('/', authenticate, getFiles); // Backward compatibility - gets all files
router.post('/', authenticate, uploadMiddleware.single('file'), uploadFile); // Changed to single file upload for folder support
{/*router.get('/:id', authenticate, getFileDetails);*/}
router.get('/:id/download', authenticate, downloadFile);
router.put('/:id', authenticate, updateFile);
router.delete('/:id', authenticate, deleteFile);

// =========== MYFILES PAGE ROUTES ===========
router.get('/my-files', authenticate, getFiles); // Reuse getFiles with pagination
router.get('/stats/summary', authenticate, getFileStats);
router.get('/departments/list', authenticate, getDepartments);
router.get('/categories/counts', authenticate, getCategoryCounts);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Upload routes working',
    timestamp: new Date().toISOString(),
    endpoints: [
      { method: 'GET', path: '/api/upload/user', description: 'Get user files with folder support (use ?folder_id=root or ?folder_id=1)' },
      { method: 'GET', path: '/api/upload/items', description: 'Get all items (files + folders) for a folder (use ?parent_id=root or ?parent_id=1)' },
      { method: 'GET', path: '/api/upload/search', description: 'Search files and folders (use ?query=searchterm&folder_id=1)' },
      { method: 'PUT', path: '/api/upload/:id/move', description: 'Move file to different folder (body: {folder_id: "root" or number})' },
      { method: 'GET', path: '/api/upload/public', description: 'Get all public files' },
      { method: 'GET', path: '/api/upload/shared', description: 'Files shared with me' },
      { method: 'PUT', path: '/api/upload/:id/visibility', description: 'Toggle file visibility' },
      { method: 'GET', path: '/api/upload/:id/visibility', description: 'Check file visibility' },
      { method: 'POST', path: '/api/upload/', description: 'Upload single file (supports folder_id in body)' },
      { method: 'GET', path: '/api/upload/', description: 'Get all user files (backward compatible)' }
    ]
  });
});

// Folder system test endpoint
router.get('/test-folders', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const testData = {
      user_id: userId,
      available_endpoints: {
        get_user_files: 'GET /api/upload/user?folder_id=root',
        get_all_items: 'GET /api/upload/items?parent_id=root',
        create_folder: 'POST /api/folders (with {name: "Folder Name", parent_id: "root"})',
        get_folders: 'GET /api/folders?parent_id=root'
      },
      note: 'Make sure to run the SQL migration to create folders table first'
    };
    
    res.json({
      success: true,
      message: 'Folder system test endpoint',
      data: testData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
});

export default router;