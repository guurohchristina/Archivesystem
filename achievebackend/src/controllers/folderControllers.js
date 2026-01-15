import { query } from '../config/db.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to recursively delete folders
const deleteFolderRecursive = async (folderId, userId) => {
  try {
    console.log(`🗑️ Recursively deleting folder ${folderId} and its contents`);
    
    // Get all child folders
    const childFolders = await query(
      'SELECT id FROM folders WHERE parent_id = $1 AND owner_id = $2',
      [folderId, userId]
    );

    console.log(`📂 Found ${childFolders.rows.length} subfolders to delete`);

    // Delete files in each child folder
    for (const childFolder of childFolders.rows) {
      console.log(`🗑️ Processing subfolder ${childFolder.id}`);
      
      // Delete files in this child folder
      const deletedFiles = await query(
        'DELETE FROM files WHERE folder_id = $1 AND owner = $2 RETURNING id',
        [childFolder.id, userId]
      );
      
      console.log(`📄 Deleted ${deletedFiles.rowCount} files from subfolder`);
      
      // Recursively delete grandchildren
      await deleteFolderRecursive(childFolder.id, userId);
      
      // Delete the child folder
      await query(
        'DELETE FROM folders WHERE id = $1 AND owner_id = $2',
        [childFolder.id, userId]
      );
      
      console.log(`✅ Deleted subfolder ${childFolder.id}`);
    }
  } catch (error) {
    console.error('❌ Error in recursive folder deletion:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

// Helper to validate folder name
const validateFolderName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'Folder name is required' };
  }
  
  if (name.length > 255) {
    return { valid: false, message: 'Folder name cannot exceed 255 characters' };
  }
  
  // Prevent certain characters that might cause issues
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidChars.test(name)) {
    return { valid: false, message: 'Folder name contains invalid characters' };
  }
  
  return { valid: true, message: 'Valid folder name' };
};

// Helper to validate ID is a number
const validateId = (id) => {
  if (!id) return { valid: false, message: 'ID is required' };
  
  // Check if it's "root" keyword
  if (id === 'root') return { valid: true, message: 'Valid root ID', isRoot: true };
  
  // Check if it's a number
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return { valid: false, message: 'Invalid ID format' };
  }
  
  return { valid: true, message: 'Valid numeric ID', id: numId };
};

// ============================================
// MAIN CONTROLLER FUNCTIONS
// ============================================

// Create a new folder
export const createFolder = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('📁 ========= CREATE FOLDER REQUEST =========');
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Authenticated user:', req.user);
    
    const { name, parent_id } = req.body;
    const userId = req.user.userId || req.user.id;
    
    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    console.log('🔍 Extracted data:', { 
      name, 
      parent_id, 
      userId,
      userIdType: typeof userId
    });

    // Validate folder name
    const nameValidation = validateFolderName(name);
    if (!nameValidation.valid) {
      console.log(`❌ Folder name validation failed: ${nameValidation.message}`);
      return res.status(400).json({
        success: false,
        message: nameValidation.message
      });
    }

    const trimmedName = name.trim();
    console.log(`✅ Folder name validated: "${trimmedName}"`);

    // Validate and handle parent folder
    let parentFolderId = null;
    if (parent_id && parent_id !== 'root') {
      const parentValidation = validateId(parent_id);
      if (!parentValidation.valid) {
        console.log(`❌ Invalid parent ID: ${parent_id}`);
        return res.status(400).json({
          success: false,
          message: parentValidation.message
        });
      }
      
      console.log(`🔍 Verifying parent folder: ${parent_id}`);
      
      try {
        const parentFolder = await query(
          'SELECT id, name FROM folders WHERE id = $1 AND owner_id = $2',
          [parentValidation.id, userId]
        );
        
        console.log('📋 Parent folder query result:', {
          rowCount: parentFolder.rowCount,
          rows: parentFolder.rows
        });
        
        if (parentFolder.rows.length === 0) {
          console.log(`❌ Parent folder ${parent_id} not found or access denied`);
          return res.status(404).json({
            success: false,
            message: 'Parent folder not found or access denied'
          });
        }
        
        parentFolderId = parentValidation.id;
        console.log(`✅ Parent folder verified: ${parentFolder.rows[0].name}`);
        
      } catch (dbError) {
        console.error('❌ Database error checking parent folder:', dbError.message);
        console.error('Full error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Error verifying parent folder',
          ...(process.env.NODE_ENV === 'development' && { error: dbError.message })
        });
      }
    } else {
      console.log('📂 Creating folder at root level');
    }

    // Check for duplicate folder name in the same location
    console.log('🔍 Checking for duplicate folder name...');
    try {
      let duplicateCheckQuery;
      let duplicateCheckParams;
      
      if (parentFolderId) {
        duplicateCheckQuery = 'SELECT id FROM folders WHERE name = $1 AND owner_id = $2 AND parent_id = $3';
        duplicateCheckParams = [trimmedName, userId, parentFolderId];
      } else {
        duplicateCheckQuery = 'SELECT id FROM folders WHERE name = $1 AND owner_id = $2 AND parent_id IS NULL';
        duplicateCheckParams = [trimmedName, userId];
      }
      
      const existingFolder = await query(duplicateCheckQuery, duplicateCheckParams);
      
      if (existingFolder.rows.length > 0) {
        console.log(`❌ Duplicate folder found: "${trimmedName}" already exists in this location`);
        return res.status(400).json({
          success: false,
          message: 'A folder with this name already exists in this location'
        });
      }
      
      console.log('✅ No duplicate folder found');
      
    } catch (checkError) {
      console.error('❌ Error checking for duplicates:', checkError.message);
      throw checkError;
    }

    // Create folder
    console.log('🚀 Attempting to create folder...');
    console.log('📝 INSERT values:', {
      name: trimmedName,
      owner_id: userId,
      parent_id: parentFolderId
    });

    const result = await query(
      `INSERT INTO folders (name, owner_id, parent_id, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING id, name, owner_id, parent_id, created_at, updated_at`,
      [trimmedName, userId, parentFolderId]
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Folder created successfully in ${duration}ms!`);
    console.log('📋 Created folder:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: result.rows[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ========= CREATE FOLDER FAILED (${duration}ms) =========`);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Error stack:', error.stack);
    
    console.error('Request details:', {
      body: req.body,
      user: req.user,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers
    });

    // Handle specific database errors
    let userMessage = 'Server error while creating folder';
    let statusCode = 500;
    
    if (error.code === '23505') { // Unique violation
      userMessage = 'A folder with this name already exists in this location';
      statusCode = 400;
    } else if (error.code === '23503') { // Foreign key violation
      userMessage = 'Parent folder does not exist or invalid user ID';
      statusCode = 400;
    } else if (error.code === '23502') { // Not null violation
      userMessage = 'Missing required fields';
      statusCode = 400;
    } else if (error.message.includes('permission denied')) {
      userMessage = 'Database permission denied. Contact administrator.';
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      // Only send error details in development
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      }),
      timestamp: new Date().toISOString()
    });
  }
};

// Get folders by parent
export const getFolders = async (req, res) => {
  try {
    console.log('📂 ========= GET FOLDERS REQUEST =========');
    console.log('📦 Query parameters:', req.query);
    console.log('👤 User ID:', req.user.userId);
    
    const { parent_id } = req.query;
    const userId = req.user.userId;

    let sql;
    let params;
    
    // Handle root folder (null parent_id) vs nested folders
    if (parent_id === 'root' || !parent_id) {
      sql = 'SELECT * FROM folders WHERE owner_id = $1 AND parent_id IS NULL ORDER BY name ASC';
      params = [userId];
      console.log('🔍 Fetching root folders');
    } else if (parent_id) {
      const parentValidation = validateId(parent_id);
      if (!parentValidation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent folder ID'
        });
      }
      
      console.log(`🔍 Fetching folders inside parent: ${parent_id}`);
      
      // Verify the parent folder exists and belongs to user
      const parentFolder = await query(
        'SELECT id, name FROM folders WHERE id = $1 AND owner_id = $2',
        [parentValidation.id, userId]
      );
      
      if (parentFolder.rows.length === 0) {
        console.log(`❌ Parent folder ${parent_id} not found or access denied`);
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found or access denied'
        });
      }
      
      sql = 'SELECT * FROM folders WHERE owner_id = $1 AND parent_id = $2 ORDER BY name ASC';
      params = [userId, parentValidation.id];
      console.log(`✅ Parent folder verified: ${parentFolder.rows[0].name}`);
    }

    console.log('📊 Executing query:', sql);
    console.log('📊 Query parameters:', params);
    
    const result = await query(sql, params);
    
    console.log(`✅ Found ${result.rows.length} folders`);
    
    // Convert IDs to strings for consistency with frontend
    const folders = result.rows.map(folder => ({
      ...folder,
      id: folder.id.toString()
    }));
    
    res.json({
      success: true,
      folders,
      count: folders.length,
      parent_id: parent_id || 'root'
    });

  } catch (error) {
    console.error('❌ Error fetching folders:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folders',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Get folder by ID
export const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log(`🔍 Getting folder by ID: ${id} for user: ${userId}`);

    const idValidation = validateId(id);
    if (!idValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID'
      });
    }

    const result = await query(
      'SELECT * FROM folders WHERE id = $1 AND owner_id = $2',
      [idValidation.id, userId]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Folder ${id} not found or access denied`);
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    console.log(`✅ Found folder: ${result.rows[0].name}`);
    
    // Convert ID to string for consistency
    const folder = {
      ...result.rows[0],
      id: result.rows[0].id.toString()
    };
    
    res.json({
      success: true,
      folder
    });

  } catch (error) {
    console.error('❌ Error fetching folder:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folder',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Delete folder and its contents
export const deleteFolder = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log(`🗑️ ========= DELETE FOLDER REQUEST =========`);
    console.log(`📂 Folder ID to delete: ${id}`);
    console.log(`👤 User ID: ${userId}`);

    const idValidation = validateId(id);
    if (!idValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID'
      });
    }

    // Find the folder
    const folder = await query(
      'SELECT id, name FROM folders WHERE id = $1 AND owner_id = $2',
      [idValidation.id, userId]
    );

    if (folder.rows.length === 0) {
      console.log(`❌ Folder ${id} not found or access denied`);
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const folderName = folder.rows[0].name;
    console.log(`📂 Found folder to delete: "${folderName}" (${id})`);

    // Delete all files in this folder
    console.log('🗑️ Deleting files in folder...');
    const deletedFiles = await query(
      'DELETE FROM files WHERE folder_id = $1 AND owner = $2 RETURNING id, original_name',
      [idValidation.id, userId]
    );
    
    console.log(`📄 Deleted ${deletedFiles.rowCount} files from folder`);

    // Recursively delete all subfolders
    console.log('🗑️ Recursively deleting subfolders...');
    await deleteFolderRecursive(idValidation.id, userId);

    // Delete the folder itself
    console.log('🗑️ Deleting folder...');
    await query(
      'DELETE FROM folders WHERE id = $1 AND owner_id = $2',
      [idValidation.id, userId]
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Folder "${folderName}" and all its contents deleted successfully in ${duration}ms`);

    res.json({
      success: true,
      message: 'Folder and all its contents deleted successfully',
      folder: {
        id,
        name: folderName
      },
      files_deleted: deletedFiles.rowCount,
      duration: `${duration}ms`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error deleting folder (${duration}ms):`, error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting folder',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
      duration: `${duration}ms`
    });
  }
};

// Get breadcrumbs for a folder
export const getBreadcrumbs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log(`🧭 Getting breadcrumbs for folder: ${id}`);

    const idValidation = validateId(id);
    if (!idValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID'
      });
    }

    // First verify the folder exists and belongs to user
    const folder = await query(
      'SELECT id, name FROM folders WHERE id = $1 AND owner_id = $2',
      [idValidation.id, userId]
    );

    if (folder.rows.length === 0) {
      console.log(`❌ Folder ${id} not found or access denied`);
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    console.log(`✅ Found folder: ${folder.rows[0].name}`);

    const breadcrumbs = [];
    let currentId = idValidation.id;

    // Start with current folder
    breadcrumbs.unshift({
      id: currentId.toString(),
      name: folder.rows[0].name
    });

    console.log('🧭 Building breadcrumb trail...');

    // Traverse up the hierarchy
    let depth = 0;
    while (currentId && depth < 20) { // Safety limit
      depth++;
      
      const result = await query(
        'SELECT id, name, parent_id FROM folders WHERE id = $1 AND owner_id = $2',
        [currentId, userId]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️ Folder ${currentId} not found during traversal`);
        break;
      }

      const currentFolder = result.rows[0];
      
      if (!currentFolder.parent_id) {
        console.log(`🏁 Reached root level at depth ${depth}`);
        break;
      }

      // Get parent folder
      const parentResult = await query(
        'SELECT id, name FROM folders WHERE id = $1 AND owner_id = $2',
        [currentFolder.parent_id, userId]
      );

      if (parentResult.rows.length === 0) {
        console.log(`⚠️ Parent folder ${currentFolder.parent_id} not found`);
        break;
      }

      const parentFolder = parentResult.rows[0];
      breadcrumbs.unshift({
        id: parentFolder.id.toString(),
        name: parentFolder.name
      });

      currentId = parentFolder.id;
      console.log(`⬆️ Added parent: ${parentFolder.name} (${parentFolder.id})`);
    }

    // Add root
    breadcrumbs.unshift({
      id: 'root',
      name: 'My Files'
    });

    console.log(`✅ Built breadcrumbs with ${breadcrumbs.length} items:`, 
      breadcrumbs.map(b => b.name).join(' → '));

    res.json({
      success: true,
      breadcrumbs,
      depth: breadcrumbs.length - 1
    });

  } catch (error) {
    console.error('❌ Error fetching breadcrumbs:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching breadcrumbs',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// In folderControllers.js - Add this new function
{/*export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params; // Folder ID from the URL
    const { name } = req.body; // New name from the request body
    const userId = req.user.userId; // User ID from authentication middleware

    console.log(`Updating folder ${id} to name: ${name}`);

    // 1. Check if the folder exists and belongs to the user
    const folderCheck = await pool.query(
      'SELECT * FROM folders WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (folderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or you do not have permission to edit it.'
      });
    }

    // 2. Update the folder name in the database
    const result = await pool.query(
      'UPDATE folders SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, updated_at',
      [name, id]
    );

    // 3. Send back the updated folder info
    res.json({
      success: true,
      message: 'Folder updated successfully.',
      folder: result.rows[0]
    });

  } catch (error) {
    console.error('Error in updateFolder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating the folder.',
      error: error.message
    });
  }
};*/}







// Rename folder
 const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    console.log(`✏️ Renaming folder ${id} to "${name}"`);

    // Validate folder name
    const nameValidation = validateFolderName(name);
    if (!nameValidation.valid) {
      console.log(`❌ Folder name validation failed: ${nameValidation.message}`);
      return res.status(400).json({
        success: false,
        message: nameValidation.message
      });
    }

    // Validate folder ID
    const idValidation = validateId(id);
    if (!idValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID'
      });
    }

    const trimmedName = name.trim();

    // Get current folder to check parent_id
    const currentFolder = await query(
      'SELECT parent_id FROM folders WHERE id = $1 AND owner_id = $2',
      [idValidation.id, userId]
    );

    if (currentFolder.rows.length === 0) {
      console.log(`❌ Folder ${id} not found or access denied`);
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const parent_id = currentFolder.rows[0].parent_id;

    // Check if another folder with same name exists in same location
    const checkQuery = parent_id 
      ? 'SELECT id FROM folders WHERE name = $1 AND owner_id = $2 AND parent_id = $3 AND id != $4'
      : 'SELECT id FROM folders WHERE name = $1 AND owner_id = $2 AND parent_id IS NULL AND id != $3';
    
    const checkParams = parent_id 
      ? [trimmedName, userId, parent_id, idValidation.id]
      : [trimmedName, userId, idValidation.id];
    
    const existingFolder = await query(checkQuery, checkParams);
    
    if (existingFolder.rows.length > 0) {
      console.log(`❌ Duplicate folder name found: "${trimmedName}"`);
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists in this location'
      });
    }

    // Rename folder
    const result = await query(
      'UPDATE folders SET name = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING *',
      [trimmedName, idValidation.id, userId]
    );

    console.log(`✅ Folder renamed to "${trimmedName}"`);
    
    // Convert ID to string
    const folder = {
      ...result.rows[0],
      id: result.rows[0].id.toString()
    };

    res.json({
      success: true,
      message: 'Folder renamed successfully',
      folder
    });

  } catch (error) {
    console.error('❌ Error renaming folder:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while renaming folder',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Move folder to different parent
export const moveFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_parent_id } = req.body;
    const userId = req.user.userId;

    console.log(`🔄 Moving folder ${id} to new parent: ${new_parent_id || 'root'}`);

    // Validate IDs
    const idValidation = validateId(id);
    if (!idValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID'
      });
    }

    // Validate that we're not moving a folder into itself or its descendant
    if (new_parent_id && new_parent_id !== 'root' && parseInt(new_parent_id) === idValidation.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot move a folder into itself'
      });
    }

    // Get current folder
    const currentFolder = await query(
      'SELECT id, name, parent_id FROM folders WHERE id = $1 AND owner_id = $2',
      [idValidation.id, userId]
    );

    if (currentFolder.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // If new parent is provided, verify it exists
    let newParentId = null;
    if (new_parent_id && new_parent_id !== 'root') {
      const newParentValidation = validateId(new_parent_id);
      if (!newParentValidation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid target folder ID'
        });
      }

      const newParent = await query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2',
        [newParentValidation.id, userId]
      );

      if (newParent.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Target folder not found'
        });
      }

      // Check for circular reference (moving into a descendant)
      let checkId = newParentValidation.id;
      let depth = 0;
      while (checkId && depth < 50) {
        if (checkId === idValidation.id) {
          return res.status(400).json({
            success: false,
            message: 'Cannot move a folder into its own descendant'
          });
        }
        
        const parentCheck = await query(
          'SELECT parent_id FROM folders WHERE id = $1 AND owner_id = $2',
          [checkId, userId]
        );
        
        if (parentCheck.rows.length === 0 || !parentCheck.rows[0].parent_id) {
          break;
        }
        
        checkId = parentCheck.rows[0].parent_id;
        depth++;
      }

      newParentId = newParentValidation.id;
    }

    // Check for duplicate name in new location
    const duplicateCheck = newParentId 
      ? 'SELECT id FROM folders WHERE name = $1 AND owner_id = $2 AND parent_id = $3 AND id != $4'
      : 'SELECT id FROM folders WHERE name = $1 AND owner_id = $2 AND parent_id IS NULL AND id != $3';
    
    const duplicateParams = newParentId 
      ? [currentFolder.rows[0].name, userId, newParentId, idValidation.id]
      : [currentFolder.rows[0].name, userId, idValidation.id];
    
    const duplicate = await query(duplicateCheck, duplicateParams);
    
    if (duplicate.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists in the target location'
      });
    }

    // Move the folder
    const result = await query(
      'UPDATE folders SET parent_id = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 RETURNING *',
      [newParentId, idValidation.id, userId]
    );

    console.log(`✅ Folder moved successfully`);
    
    // Convert ID to string
    const folder = {
      ...result.rows[0],
      id: result.rows[0].id.toString()
    };

    res.json({
      success: true,
      message: 'Folder moved successfully',
      folder
    });

  } catch (error) {
    console.error('❌ Error moving folder:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Server error while moving folder',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Diagnostic function to check database state
export const diagnoseFolderIssue = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.userId;
    
    console.log('🔍 ========= FOLDER DIAGNOSIS =========');
    console.log('👤 User ID:', userId);
    console.log('📊 User ID type:', typeof userId);
    
    // 1. Check if folders table exists
    console.log('\n1. Checking if folders table exists...');
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'folders'
      ) as exists
    `);
    
    const tableExistsResult = tableExists.rows[0].exists;
    console.log('📊 Folders table exists:', tableExistsResult);
    
    if (!tableExistsResult) {
      const duration = Date.now() - startTime;
      return res.json({
        success: false,
        message: 'Folders table does not exist. Run the SQL migration first.',
        diagnosis: {
          table_exists: false,
          duration: `${duration}ms`
        }
      });
    }
    
    // 2. Check table structure
    console.log('\n2. Checking folders table structure...');
    const columns = await query(`
      SELECT column_name, data_type, is_nullable, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'folders'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Table columns:');
    const columnStructure = columns.rows.map(col => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES',
      max_length: col.character_maximum_length
    }));
    
    columnStructure.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.nullable ? '(nullable)' : '(not null)'}`);
    });
    
    // 3. Test a simple query
    console.log('\n3. Testing a simple query...');
    const testQuery = await query(
      'SELECT COUNT(*) as count FROM folders WHERE owner_id = $1', 
      [userId]
    );
    const folderCount = parseInt(testQuery.rows[0].count);
    console.log(`📊 Folders count for user: ${folderCount}`);
    
    // 4. Test insert (will be rolled back)
    console.log('\n4. Testing folder creation...');
    const testName = 'Diagnostic Test ' + Date.now();
    let testFolderId = null;
    
    try {
      const testInsert = await query(
        `INSERT INTO folders (name, owner_id, parent_id) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, owner_id`,
        [testName, userId, null]
      );
      
      testFolderId = testInsert.rows[0].id;
      console.log('✅ Test insert successful!');
      console.log('📊 Created folder:', testInsert.rows[0]);
      
      // Clean up
      await query('DELETE FROM folders WHERE id = $1', [testFolderId]);
      console.log('✅ Test folder cleaned up');
      
    } catch (testError) {
      console.error('❌ Test insert failed:');
      console.error('Error:', testError.message);
      console.error('Code:', testError.code);
      console.error('Detail:', testError.detail);
      console.error('Hint:', testError.hint);
      
      const duration = Date.now() - startTime;
      return res.json({
        success: false,
        message: 'Folder creation test failed',
        error: testError.message,
        code: testError.code,
        detail: testError.detail,
        diagnosis: {
          table_exists: tableExistsResult,
          folder_count: folderCount,
          columns: columnStructure,
          duration: `${duration}ms`
        }
      });
    }
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Diagnosis completed in ${duration}ms`);
    
    res.json({
      success: true,
      message: 'Diagnosis complete - all checks passed',
      diagnosis: {
        table_exists: true,
        folder_count: folderCount,
        columns: columnStructure,
        test_passed: true,
        duration: `${duration}ms`
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Diagnosis failed in ${duration}ms:`, error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    res.status(500).json({
      success: false,
      message: 'Diagnosis failed',
      error: error.message,
      code: error.code,
      duration: `${duration}ms`
    });
  }
};