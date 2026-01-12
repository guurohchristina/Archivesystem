import { query } from '../config/db.js';

// Helper function to recursively delete folders
const deleteFolderRecursive = async (folderId, userId) => {
  try {
    // Get all child folders
    const childFolders = await query(
      'SELECT id FROM folders WHERE parent_id = $1 AND owner_id = $2',
      [folderId, userId]
    );

    // Delete files in each child folder
    for (const childFolder of childFolders.rows) {
      // Delete files in this child folder
      await query(
        'DELETE FROM files WHERE folder_id = $1 AND owner = $2',
        [childFolder.id, userId]
      );
      
      // Recursively delete grandchildren
      await deleteFolderRecursive(childFolder.id, userId);
      
      // Delete the child folder
      await query(
        'DELETE FROM folders WHERE id = $1 AND owner_id = $2',
        [childFolder.id, userId]
      );
    }
  } catch (error) {
    console.error('Error in recursive folder deletion:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const userId = req.user.userId;

    // Validate folder name
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }

    // If parent_id is provided, verify it exists and belongs to user
    if (parent_id && parent_id !== 'root') {
      const parentFolder = await query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2',
        [parent_id, userId]
      );
      
      if (parentFolder.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found or access denied'
        });
      }
    }

    // Create folder
    const result = await query(
      `INSERT INTO folders (name, owner_id, parent_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, owner_id, parent_id, created_at`,
      [
        name.trim(),
        userId,
        parent_id && parent_id !== 'root' ? parent_id : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating folder'
    });
  }
};

// Get folders by parent
export const getFolders = async (req, res) => {
  try {
    const { parent_id } = req.query;
    const userId = req.user.userId;

    let sql;
    let params;
    
    // Handle root folder (null parent_id) vs nested folders
    if (parent_id === 'root' || !parent_id) {
      sql = 'SELECT * FROM folders WHERE owner_id = $1 AND parent_id IS NULL ORDER BY name ASC';
      params = [userId];
    } else if (parent_id) {
      // Verify the parent folder exists and belongs to user
      const parentFolder = await query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2',
        [parent_id, userId]
      );
      
      if (parentFolder.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found or access denied'
        });
      }
      
      sql = 'SELECT * FROM folders WHERE owner_id = $1 AND parent_id = $2 ORDER BY name ASC';
      params = [userId, parent_id];
    }

    const result = await query(sql, params);
    
    res.json({
      success: true,
      folders: result.rows
    });

  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folders'
    });
  }
};

// Get folder by ID
export const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      'SELECT * FROM folders WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    res.json({
      success: true,
      folder: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folder'
    });
  }
};

// Delete folder and its contents
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find the folder
    const folder = await query(
      'SELECT id FROM folders WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (folder.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Delete all files in this folder
    await query(
      'DELETE FROM files WHERE folder_id = $1 AND owner = $2',
      [id, userId]
    );

    // Recursively delete all subfolders
    await deleteFolderRecursive(id, userId);

    // Delete the folder itself
    await query(
      'DELETE FROM folders WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Folder and all its contents deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting folder'
    });
  }
};

// Get breadcrumbs for a folder (using SQL function)
export const getBreadcrumbs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // First verify the folder exists and belongs to user
    const folder = await query(
      'SELECT id FROM folders WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (folder.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Get breadcrumbs using the SQL function
    const result = await query(
      'SELECT * FROM get_folder_breadcrumbs($1)',
      [id]
    );

    // Reverse the array to get root -> current folder order
    const breadcrumbs = result.rows.reverse();

    res.json({
      success: true,
      breadcrumbs
    });

  } catch (error) {
    console.error('Error fetching breadcrumbs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching breadcrumbs'
    });
  }
};

// Alternative breadcrumb method without SQL function
export const getBreadcrumbsAlt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const breadcrumbs = [];
    let currentId = id;

    while (currentId) {
      const result = await query(
        'SELECT id, name, parent_id FROM folders WHERE id = $1 AND owner_id = $2',
        [currentId, userId]
      );

      if (result.rows.length === 0) {
        break;
      }

      const folder = result.rows[0];
      breadcrumbs.unshift({
        id: folder.id,
        name: folder.name
      });

      currentId = folder.parent_id;
    }

    // Add root if no parent
    if (breadcrumbs.length > 0) {
      breadcrumbs.unshift({
        id: 'root',
        name: 'My Files'
      });
    }

    res.json({
      success: true,
      breadcrumbs
    });

  } catch (error) {
    console.error('Error fetching breadcrumbs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching breadcrumbs'
    });
  }
};