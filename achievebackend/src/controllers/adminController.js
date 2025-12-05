
// src/controllers/adminController.j

import { query } from '../config/db.js';

export const adminController = {
  getAllUsers: async (req, res) => {
    try {
      // Only admin can access
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let queryStr = `
        SELECT id, name, email, role, created_at,
               (SELECT COUNT(*) FROM files WHERE user_id = users.id) as file_count
        FROM users
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        queryStr += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }

      queryStr += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryStr, params);

      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1',
        [`%${search}%`]
      );

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          users: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalUsers: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      // Don't allow demoting yourself
      if (parseInt(userId) === req.user.userId && role === 'user') {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote yourself from admin'
        });
      }

      const result = await query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
        [role, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role'
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { userId } = req.params;

      // Don't allow deleting yourself
      if (parseInt(userId) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Delete user (cascade will delete their files)
      const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, name', [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user'
      });
    }
  },

  getAllFiles: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { page = 1, limit = 20, userId, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let queryStr = `
        SELECT f.*, 
               u.name as user_name,
               u.email as user_email
        FROM files f
        JOIN users u ON f.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (userId) {
        queryStr += ` AND f.user_id = $${params.length + 1}`;
        params.push(userId);
      }

      if (search) {
        queryStr += ` AND (f.original_name ILIKE $${params.length + 1} OR f.description ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }

      queryStr += ` ORDER BY f.uploaded_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryStr, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM files f WHERE 1=1';
      const countParams = [];

      if (userId) {
        countQuery += ` AND f.user_id = $${countParams.length + 1}`;
        countParams.push(userId);
      }

      if (search) {
        countQuery += ` AND (f.original_name ILIKE $${countParams.length + 1} OR f.description ILIKE $${countParams.length + 1})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await query(countQuery, countParams);

      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          files: result.rows,
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
      console.error('Get all files error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching files'
      });
    }
  },

  deleteFileAsAdmin: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { fileId } = req.params;

      // Get file info
      const fileResult = await query(
        'SELECT * FROM files WHERE id = $1',
        [fileId]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      const file = fileResult.rows[0];

      // Delete from filesystem
      const fs = require('fs');
      fs.unlinkSync(file.file_path);

      // Delete from database
      await query('DELETE FROM files WHERE id = $1', [fileId]);

      res.json({
        success: true,
        message: 'File deleted successfully',
        data: { fileId, filename: file.original_name }
      });
    } catch (error) {
      console.error('Admin delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file'
      });
    }
  }
};






// controllers/adminController.js (note singular 'Controller', not 'Controllers')
/*
import User from '../models/User.js';
import File from '../models/files.js';

// Get all users with pagination and search ach
export const getAllUsers = async (req, res) => {
  try {
    console.log('🔍 GET /api/admin/users called');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    console.log('Query params:', { page, limit, search });

    // Build query for search
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    console.log('Query:', query);

    // Get total count
    const totalUsers = await User.countDocuments(query);
    console.log('Total users:', totalUsers);
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Found users:', users.length);

    // Get file counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const fileCount = await File.countDocuments({ user_id: user._id });
        return {
          ...user,
          id: user._id,
          file_count: fileCount
        };
      })
    );

    console.log('Users with stats ready');

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    console.log('🔄 Update role request:', { userId, role });

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🗑️ Delete user request:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's files
    await File.deleteMany({ user_id: userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all files (admin)
export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().populate('user_id', 'name email');
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete file as admin
export const deleteFileAsAdmin = async (req, res) => {
  try {
    const { fileId } = req.params;
    await File.findByIdAndDelete(fileId);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export controller object
export const adminController = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllFiles,
  deleteFileAsAdmin
};
*/



