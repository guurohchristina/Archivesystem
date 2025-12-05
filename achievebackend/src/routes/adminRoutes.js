
// src/routes/adminRoutes.js
import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.get('/users', authenticate, authorize('admin'), adminController.getAllUsers);
router.put('/users/:userId/role', authenticate, authorize('admin'), adminController.updateUserRole);
router.delete('/users/:userId', authenticate, authorize('admin'), adminController.deleteUser);
router.get('/files', authenticate, authorize('admin'), adminController.getAllFiles);
router.delete('/files/:fileId', authenticate, authorize('admin'), adminController.deleteFileAsAdmin);

export default router;