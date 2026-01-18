import express from 'express';
import {authenticate} from '../middleware/authMiddleware.js';
import {
  createFolder,
  getFolders,
  getFolderById,
  deleteFolder,
  renameFolder,
  
} from '../controllers/folderControllers.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new folder
router.post('/', createFolder);

// Get folders by parent
router.get('/content', getFolderContent);

// Get specific folder by ID
router.get('/:id', getFolderById);

router.put('/:id', renameFolder);

// Delete folder and its contents
router.delete('/:id', deleteFolder);


// Get breadcrumbs for a folder
{/*router.get('/:id/breadcrumbs', getBreadcrumbsAlt);*/} // Using alternative method

export default router;