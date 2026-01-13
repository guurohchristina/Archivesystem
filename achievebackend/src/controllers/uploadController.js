import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../config/db.js';

// =========== MULTER CONFIGURATION ===========
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

export const uploadMiddleware = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// =========== HELPER FUNCTIONS ===========

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

// Helper to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper to determine file type
const determineFileType = (fileName, fileMime) => {
  const fileNameLower = fileName?.toLowerCase() || '';
  const fileMimeLower = fileMime?.toLowerCase() || '';
  
  if (fileNameLower.includes('.pdf') || fileMimeLower.includes('pdf')) return "pdf";
  else if (fileNameLower.includes('.doc') || fileNameLower.includes('.docx') || fileMimeLower.includes('word')) return "doc";
  else if (fileNameLower.includes('.xls') || fileNameLower.includes('.xlsx') || fileNameLower.includes('.csv') || fileMimeLower.includes('excel') || fileMimeLower.includes('sheet')) return "spreadsheet";
  else if (fileNameLower.includes('.jpg') || fileNameLower.includes('.jpeg') || fileNameLower.includes('.png') || fileNameLower.includes('.gif') || fileNameLower.includes('.bmp') || fileMimeLower.includes('image')) return "image";
  else if (fileNameLower.includes('.mp4') || fileNameLower.includes('.mov') || fileNameLower.includes('.avi') || fileNameLower.includes('.mkv') || fileMimeLower.includes('video')) return "video";
  else if (fileNameLower.includes('.mp3') || fileNameLower.includes('.wav') || fileNameLower.includes('.aac') || fileMimeLower.includes('audio')) return "audio";
  else if (fileNameLower.includes('.zip') || fileNameLower.includes('.rar') || fileNameLower.includes('.7z') || fileMimeLower.includes('archive') || fileMimeLower.includes('compressed')) return "archive";
  else return "document";
};

// =========== CONTROLLER FUNCTIONS ===========

// Get user files with folder support
export const getUserFiles = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.userId;
    const { folder_id } = req.query;

    console.log('📂 ========= GET USER FILES REQUEST =========');
    console.log('👤 User ID:', userId);
    console.log('📦 Folder ID from query:', folder_id || 'root');

    // Validate user ID
    if (!userId) {
      console.error('❌ No user ID provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let sql;
    let params;
    let folderInfo = null;
    
    // Handle different folder scenarios
    if (folder_id === 'root' || !folder_id) {
      // Get files in root (folder_id is NULL)
      console.log('🔍 Fetching files from root folder');
      sql = `
        SELECT 
          f.*,
          u.username as owner_name
        FROM files f
        LEFT JOIN users u ON f.user_id = u.id
        WHERE f.user_id = $1 
        AND (f.folder_id IS NULL)
        ORDER BY f.uploaded_at DESC
      `;
      params = [userId];
    } 
    else if (folder_id) {
      // Parse folder_id to integer
      const folderIdNum = parseInt(folder_id);
      
      if (isNaN(folderIdNum) || folderIdNum <= 0) {
        console.error(`❌ Invalid folder ID format: ${folder_id}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid folder ID format'
        });
      }

      console.log(`🔍 Fetching files from folder ID: ${folderIdNum}`);

      // First, verify the folder exists and belongs to user
      try {
        const folderCheck = await query(
          'SELECT id, name, created_at FROM folders WHERE id = $1 AND owner_id = $2',
          [folderIdNum, userId]
        );
        
        console.log('📋 Folder check result:', {
          rowCount: folderCheck.rowCount,
          rows: folderCheck.rows
        });
        
        if (folderCheck.rows.length === 0) {
          console.log(`❌ Folder ${folderIdNum} not found or access denied for user ${userId}`);
          return res.status(404).json({
            success: false,
            message: 'Folder not found or access denied'
          });
        }
        
        // Store folder info
        folderInfo = {
          ...folderCheck.rows[0],
          id: folderCheck.rows[0].id.toString() // Convert to string for consistency
        };
        
        console.log(`✅ Folder verified: "${folderInfo.name}" (ID: ${folderInfo.id})`);
        
      } catch (folderError) {
        console.error('❌ Error checking folder:', folderError.message);
        console.error('Folder error stack:', folderError.stack);
        
        return res.status(500).json({
          success: false,
          message: 'Error verifying folder',
          ...(process.env.NODE_ENV === 'development' && { error: folderError.message })
        });
      }

      // Get files in the specified folder
      sql = `
        SELECT 
          f.*,
          u.username as owner_name
        FROM files f
        LEFT JOIN users u ON f.user_id = u.id
        WHERE f.user_id = $1 
        AND f.folder_id = $2
        ORDER BY f.uploaded_at DESC
      `;
      params = [userId, folderIdNum];
    }

    console.log('📊 Executing SQL query:', sql.substring(0, 200) + '...');
    console.log('📊 Query parameters:', params);

    // Execute the query
    const result = await query(sql, params);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Found ${result.rows.length} files in ${duration}ms`);
    
    // If we found files, log some details
    if (result.rows.length > 0) {
      console.log('📋 Sample files (first 3):');
      result.rows.slice(0, 3).forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.original_name} (${file.filetype}, ${file.file_size} bytes)`);
      });
    }

    // Format files for response
    const formattedFiles = result.rows.map(file => {
      // Determine file type
      const fileType = determineFileType(file.original_name, file.filetype);
      
      // Format date
      let formattedDate = "Unknown";
      if (file.uploaded_at) {
        const date = new Date(file.uploaded_at);
        formattedDate = date.toLocaleDateString("en-US", {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return {
        ...file,
        formatted_size: formatFileSize(file.file_size),
        formatted_date: formattedDate,
        file_type: fileType,
        id: file.id.toString(), // Ensure ID is string
        folder_id: file.folder_id ? file.folder_id.toString() : null
      };
    });

    // Calculate storage stats
    const totalStorage = result.rows.reduce((sum, file) => {
      return sum + (parseInt(file.file_size) || 0);
    }, 0);

    console.log(`📊 Storage used in this folder: ${formatFileSize(totalStorage)}`);
    
    const response = {
      success: true,
      files: formattedFiles,
      count: formattedFiles.length,
      storage_used: formatFileSize(totalStorage),
      storage_bytes: totalStorage,
      current_folder_id: folder_id || 'root',
      folder: folderInfo,
      query_duration: `${duration}ms`
    };

    console.log('📤 Sending response with', formattedFiles.length, 'files');
    
    res.json(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ========= GET USER FILES FAILED (${duration}ms) =========`);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    console.error('Request details:', {
      user: req.user,
      query: req.query,
      method: req.method,
      url: req.originalUrl
    });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        code: error.code
      }),
      query_duration: `${duration}ms`
    });
  }
};

// Get all user items (files + folders) for MyFiles page
export const getAllUserItems = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.userId;
    const { parent_id } = req.query;

    console.log('📦 ========= GET ALL USER ITEMS REQUEST =========');
    console.log('👤 User ID:', userId);
    console.log('📦 Parent folder ID:', parent_id || 'root');

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let parentFolderId = null;
    let parentFolderInfo = null;

    // Handle parent folder validation
    if (parent_id && parent_id !== 'root') {
      const parentIdNum = parseInt(parent_id);
      
      if (isNaN(parentIdNum) || parentIdNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent folder ID'
        });
      }

      // Verify parent folder exists
      const parentCheck = await query(
        'SELECT id, name, created_at FROM folders WHERE id = $1 AND owner_id = $2',
        [parentIdNum, userId]
      );
      
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found or access denied'
        });
      }
      
      parentFolderId = parentIdNum;
      parentFolderInfo = {
        ...parentCheck.rows[0],
        id: parentCheck.rows[0].id.toString()
      };
    }

    // Get files in current folder
    let filesSql;
    let filesParams;
    
    if (parent_id === 'root' || !parent_id) {
      filesSql = `
        SELECT f.*, u.username as owner_name 
        FROM files f
        LEFT JOIN users u ON f.user_id = u.id
        WHERE f.user_id = $1 AND (f.folder_id IS NULL)
        ORDER BY f.uploaded_at DESC
      `;
      filesParams = [userId];
    } else {
      filesSql = `
        SELECT f.*, u.username as owner_name 
        FROM files f
        LEFT JOIN users u ON f.user_id = u.id
        WHERE f.user_id = $1 AND f.folder_id = $2
        ORDER BY f.uploaded_at DESC
      `;
      filesParams = [userId, parentFolderId];
    }

    // Get folders in current folder
    let foldersSql;
    let foldersParams;
    
    if (parent_id === 'root' || !parent_id) {
      foldersSql = `
        SELECT * FROM folders 
        WHERE owner_id = $1 AND parent_id IS NULL
        ORDER BY name ASC
      `;
      foldersParams = [userId];
    } else {
      foldersSql = `
        SELECT * FROM folders 
        WHERE owner_id = $1 AND parent_id = $2
        ORDER BY name ASC
      `;
      foldersParams = [userId, parentFolderId];
    }

    console.log('📊 Executing parallel queries for files and folders...');
    
    // Execute both queries in parallel
    const [filesResult, foldersResult] = await Promise.all([
      query(filesSql, filesParams),
      query(foldersSql, foldersParams)
    ]);

    const duration = Date.now() - startTime;
    console.log(`✅ Found ${filesResult.rows.length} files and ${foldersResult.rows.length} folders in ${duration}ms`);

    // Format files
    const formattedFiles = filesResult.rows.map(file => {
      return {
        ...file,
        formatted_size: formatFileSize(file.file_size),
        id: file.id.toString(),
        folder_id: file.folder_id ? file.folder_id.toString() : null,
        is_file: true
      };
    });

    // Format folders
    const formattedFolders = foldersResult.rows.map(folder => ({
      ...folder,
      id: folder.id.toString(),
      parent_id: folder.parent_id ? folder.parent_id.toString() : null,
      is_folder: true
    }));

    // Calculate storage
    const totalStorage = filesResult.rows.reduce((sum, file) => {
      return sum + (parseInt(file.file_size) || 0);
    }, 0);

    res.json({
      success: true,
      files: formattedFiles,
      folders: formattedFolders,
      file_count: formattedFiles.length,
      folder_count: formattedFolders.length,
      total_items: formattedFiles.length + formattedFolders.length,
      parent_folder: parentFolderInfo,
      current_folder_id: parent_id || 'root',
      storage_used: totalStorage,
      query_duration: `${duration}ms`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error fetching all items (${duration}ms):`, error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files and folders',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
      query_duration: `${duration}ms`
    });
  }
};


{/*export const uploadFile = async (req, res) => {
  try {
    const files = req.files; // Now an array of files
    const {
      description,
      is_public,
      document_type,
      document_date,
      department,
      owner,
      classification_level,
      folder_id = 'root' // Default to root if not provided
    } = req.body;

    const userId = req.user.userId;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadResults = [];

    // Process each file
    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `uploads/${fileName}`;
      
      // Save file to disk
      // ... your file saving logic ...

      // Insert into database with folder_id
      const [result] = await db.query(
        `INSERT INTO files (user_id, original_name, file_name, file_path, file_size, filetype, description, is_public, document_type, document_date, department, owner, classification_level, folder_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          file.originalname,
          fileName,
          filePath,
          file.size,
          file.mimetype,
          description || '',
          is_public === 'true',
          document_type || '',
          document_date || null,
          department || '',
          owner || '',
          classification_level || 'Unclassified',
          folder_id === 'root' ? null : folder_id // Store NULL for root
        ]
      );

      uploadResults.push({
        id: result.insertId,
        original_name: file.originalname,
        file_name: fileName,
        file_path: filePath,
        file_size: file.size,
        filetype: file.mimetype,
        description: description || '',
        is_public: is_public === 'true',
        document_type: document_type || '',
        document_date: document_date || null,
        department: department || '',
        owner: owner || '',
        classification_level: classification_level || 'Unclassified',
        folder_id: folder_id,
        uploaded_at: new Date()
      });
    }

    res.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: uploadResults
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};*/}



export const uploadFile = async (req, res) => {
  try {
    const files = req.files; // Array of files
    const {
      description,
      is_public,
      document_type,
      document_date,
      department,
      owner,
      classification_level,
      folder_id = 'root' // Default to root if not provided
    } = req.body;

    const userId = req.user.userId;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    console.log('📤 Uploading files:', {
      fileCount: files.length,
      userId: userId,
      folderId: folder_id,
      description: description,
      owner: owner
    });

    const uploadResults = [];

    // Process each file
    for (const file of files) {
      console.log('📄 Processing file:', file.originalname);
      
      // Insert into database with folder_id
      // Note: multer already saves the file to disk, so file.path is available
      const result = await query(
        `INSERT INTO files (
          user_id, original_name, file_name, file_path, file_size, filetype, 
          description, is_public, document_type, document_date, department, 
          owner, classification_level, folder_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          userId,
          file.originalname,
          file.filename, // Use the multer-generated filename
          file.path, // Use the multer path
          file.size,
          file.mimetype,
          description || '',
          is_public === 'true' || is_public === true,
          document_type || '',
          document_date || null,
          department || '',
          owner || '',
          classification_level || 'Unclassified',
          folder_id === 'root' ? null : parseInt(folder_id) // Store NULL for root
        ]
      );

      const uploadedFile = result.rows[0];
      
      // Format file for response
      const formattedFile = {
        ...uploadedFile,
        id: uploadedFile.id.toString(),
        folder_id: uploadedFile.folder_id ? uploadedFile.folder_id.toString() : null,
        formatted_size: formatFileSize(uploadedFile.file_size),
        file_type: determineFileType(uploadedFile.original_name, uploadedFile.filetype),
        uploaded_at: new Date(uploadedFile.uploaded_at).toISOString()
      };

      uploadResults.push(formattedFile);
      
      console.log('✅ File uploaded:', {
        id: uploadedFile.id,
        name: uploadedFile.original_name,
        folderId: uploadedFile.folder_id
      });
    }

    console.log(`✅ Successfully uploaded ${uploadResults.length} files`);

    res.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: uploadResults
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific database errors
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'Invalid folder ID. Folder does not exist.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (error.code === '23502') { // Not null violation
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload files. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};








// Move file to different folder
export const moveFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { folder_id } = req.body;
    const userId = req.user.userId;

    console.log(`🔄 Moving file ${id} to folder ${folder_id || 'root'}`);

    // Validate file ID
    const fileIdNum = parseInt(id);
    if (isNaN(fileIdNum) || fileIdNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }

    // Verify file exists and belongs to user
    const file = await query(
      'SELECT id, original_name FROM files WHERE id = $1 AND user_id = $2',
      [fileIdNum, userId]
    );

    if (file.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Handle folder_id
    let finalFolderId = null;
    if (folder_id && folder_id !== 'root') {
      const folderIdNum = parseInt(folder_id);
      
      if (isNaN(folderIdNum) || folderIdNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid folder ID'
        });
      }
      
      // Verify folder exists and belongs to user
      const folder = await query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2',
        [folderIdNum, userId]
      );
      
      if (folder.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found or access denied'
        });
      }
      
      finalFolderId = folderIdNum;
    }

    // Check if file with same name already exists in target folder
    const duplicateCheck = await query(
      'SELECT id FROM files WHERE original_name = $1 AND user_id = $2 AND folder_id IS NOT DISTINCT FROM $3 AND id != $4',
      [file.rows[0].original_name, userId, finalFolderId, fileIdNum]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A file with this name already exists in the target folder'
      });
    }

    // Move file
    const result = await query(
      'UPDATE files SET folder_id = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [finalFolderId, fileIdNum, userId]
    );

    console.log('✅ File moved successfully');

    const movedFile = result.rows[0];
    const formattedFile = {
      ...movedFile,
      id: movedFile.id.toString(),
      folder_id: movedFile.folder_id ? movedFile.folder_id.toString() : null,
      formatted_size: formatFileSize(movedFile.file_size)
    };

    res.json({
      success: true,
      message: 'File moved successfully',
      file: formattedFile
    });

  } catch (error) {
    console.error('❌ Error moving file:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Server error while moving file',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Get single file by ID
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log(`🔍 Getting file details for ${id}`);

    const result = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = result.rows[0];
    
    // Get folder info if file is in a folder
    let folderInfo = null;
    if (file.folder_id) {
      const folderResult = await query(
        'SELECT id, name FROM folders WHERE id = $1 AND owner_id = $2',
        [file.folder_id, userId]
      );
      
      if (folderResult.rows.length > 0) {
        folderInfo = {
          ...folderResult.rows[0],
          id: folderResult.rows[0].id.toString()
        };
      }
    }

    const formattedFile = {
      ...file,
      id: file.id.toString(),
      folder_id: file.folder_id ? file.folder_id.toString() : null,
      formatted_size: formatFileSize(file.file_size),
      file_type: determineFileType(file.original_name, file.filetype)
    };

    res.json({
      success: true,
      file: formattedFile,
      folder: folderInfo
    });

  } catch (error) {
    console.error('❌ Error fetching file:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search files and folders
export const searchItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query: searchQuery, folder_id } = req.query;

    console.log('🔍 Searching for:', searchQuery, 'in folder:', folder_id || 'all');

    if (!searchQuery || searchQuery.trim() === '') {
      return res.json({
        success: true,
        files: [],
        folders: [],
        file_count: 0,
        folder_count: 0
      });
    }

    const searchTerm = `%${searchQuery}%`;

    // Build folder filter
    let folderFilter = '';
    let folderParams = [];
    
    if (folder_id && folder_id !== 'root') {
      const folderIdNum = parseInt(folder_id);
      if (!isNaN(folderIdNum)) {
        folderFilter = 'AND f.folder_id = $3';
        folderParams = [folderIdNum];
      }
    } else if (folder_id === 'root') {
      folderFilter = 'AND (f.folder_id IS NULL)';
    }

    // Search files
    const filesSql = `
      SELECT f.*, u.username as owner_name 
      FROM files f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.user_id = $1 
      AND (
        f.original_name ILIKE $2 
        OR f.description ILIKE $2 
        OR f.department ILIKE $2
        OR f.document_type ILIKE $2
        OR u.username ILIKE $2
      )
      ${folderFilter}
      ORDER BY f.uploaded_at DESC
    `;

    const filesParams = [userId, searchTerm, ...folderParams];
    
    // Search folders
    const foldersSql = `
      SELECT * FROM folders 
      WHERE owner_id = $1 
      AND name ILIKE $2
      ${folder_id && folder_id !== 'root' ? 'AND parent_id = $3' : folder_id === 'root' ? 'AND parent_id IS NULL' : ''}
      ORDER BY name ASC
    `;

    const foldersParams = folder_id && folder_id !== 'root' && folderParams.length > 0 
      ? [userId, searchTerm, ...folderParams]
      : [userId, searchTerm];

    const [filesResult, foldersResult] = await Promise.all([
      query(filesSql, filesParams),
      query(foldersSql, foldersParams)
    ]);

    console.log(`✅ Found ${filesResult.rows.length} files and ${foldersResult.rows.length} folders matching search`);

    res.json({
      success: true,
      files: filesResult.rows.map(f => ({
        ...f,
        id: f.id.toString(),
        folder_id: f.folder_id ? f.folder_id.toString() : null,
        formatted_size: formatFileSize(f.file_size)
      })),
      folders: foldersResult.rows.map(f => ({
        ...f,
        id: f.id.toString(),
        parent_id: f.parent_id ? f.parent_id.toString() : null
      })),
      file_count: filesResult.rows.length,
      folder_count: foldersResult.rows.length,
      search_query: searchQuery
    });

  } catch (error) {
    console.error('❌ Error searching items:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to search items',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// =========== EXISTING FUNCTIONS (updated for folder support) ===========

// Get all files for user (backward compatibility - renamed from getFiles)
export const getAllFiles = async (req, res) => {
  try {
    console.log('📂 GET /api/upload - Fetching all files for user:', req.user.userId);
    
    const result = await query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [req.user.userId]
    );
    
    console.log(`✅ Found ${result.rows.length} files for user ${req.user.userId}`);
    
    // Format files
    const formattedFiles = result.rows.map(file => ({
      ...file,
      id: file.id.toString(),
      folder_id: file.folder_id ? file.folder_id.toString() : null,
      formatted_size: formatFileSize(file.file_size),
      file_type: determineFileType(file.original_name, file.filetype)
    }));
    
    res.json({
      success: true,
      files: formattedFiles,
      count: formattedFiles.length
    });
  } catch (error) {
    console.error('❌ Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPublicFiles = async (req, res) => {
  try {
    console.log('📂 GET /api/upload/public - Fixed for your table structure');
    
    // Parse parameters with defaults
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const ownerFilter = req.query.owner || '';
    
    console.log('Parameters:', { page, limit, offset, search, ownerFilter });
    
    // Build WHERE conditions separately
    let whereConditions = ['f.is_public = true', 'f.user_id != $1'];
    let params = [req.user.userId];
    let paramCounter = 1;
    
    // Add search condition
    if (search) {
      paramCounter++;
      whereConditions.push(`(f.original_name ILIKE $${paramCounter} OR f.description ILIKE $${paramCounter})`);
      params.push(`%${search}%`);
    }
    
    // Add owner filter - uses the "owner" column in files table
    if (ownerFilter) {
      paramCounter++;
      whereConditions.push(`f.owner ILIKE $${paramCounter}`);
      params.push(`%${ownerFilter}%`);
    }
    
    // Build WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // COUNT query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM files f
      ${whereClause}
    `;
    console.log('Count query:', countQuery);
    
    const countResult = await query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total);
    
    // MAIN query - Select all columns plus owner info
    paramCounter++;
    const limitParam = paramCounter;
    paramCounter++;
    const offsetParam = paramCounter;
    
    const mainQuery = `
      SELECT 
        f.id,
        f.filename,
        f.filepath,
        f.filetype,
        f.original_name,
        f.file_size,
        f.user_id,
        f.description,
        f.is_public,
        f.document_type,
        f.document_date,
        f.department,
        f.owner as owner_name,
        f.classification_level,
        f.uploaded_at,
        f.updated_at,
        f.public_since,
        COALESCE(u.email, 'No email available') as owner_email
      FROM files f
      LEFT JOIN users u ON f.user_id = u.id
      ${whereClause}
      ORDER BY f.uploaded_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    
    const mainParams = [...params, limit, offset];
    
    console.log('Main query:', mainQuery);
    
    const result = await query(mainQuery, mainParams);
    
    console.log(`✅ Success! Found ${result.rows.length} files`);
    
    // Format the response for frontend
    const formattedFiles = result.rows.map(file => ({
      id: file.id.toString(),
      original_name: file.original_name,
      filename: file.filename,
      description: file.description,
      file_size: file.file_size,
      formatted_size: formatFileSize(file.file_size),
      file_type: determineFileType(file.original_name, file.filetype),
      filepath: file.filepath,
      user_id: file.user_id,
      owner_name: file.owner_name,
      owner_email: file.owner_email,
      created_at: file.uploaded_at,
      uploaded_at: file.uploaded_at,
      updated_at: file.updated_at,
      public_since: file.public_since,
      is_public: file.is_public,
      document_type: file.document_type,
      document_date: file.document_date,
      department: file.department,
      classification_level: file.classification_level
    }));
    
    res.json({
      success: true,
      data: {
        files: formattedFiles,
        pagination: {
          totalFiles: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit: limit
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getPublicFiles:', error.message);
    console.error('Full error:', error);
    
    // Fallback without JOIN (simpler query)
    try {
      console.log('🔄 Trying fallback without JOIN...');
      
      // Build fallback WHERE conditions
      let fallbackConditions = ['is_public = true', 'user_id != $1'];
      let fallbackParams = [req.user.userId];
      let fallbackParamCounter = 1;
      
      const search = req.query.search || '';
      const ownerFilter = req.query.owner || '';
      
      if (search) {
        fallbackParamCounter++;
        fallbackConditions.push(`(original_name ILIKE $${fallbackParamCounter} OR description ILIKE $${fallbackParamCounter})`);
        fallbackParams.push(`%${search}%`);
      }
      
      if (ownerFilter) {
        fallbackParamCounter++;
        fallbackConditions.push(`owner ILIKE $${fallbackParamCounter}`);
        fallbackParams.push(`%${ownerFilter}%`);
      }
      
      const fallbackWhereClause = fallbackConditions.length > 0 ? `WHERE ${fallbackConditions.join(' AND ')}` : '';
      
      const fallbackQuery = `
        SELECT 
          id,
          filename,
          filepath,
          filetype,
          original_name,
          description,
          file_size,
          user_id,
          owner as owner_name,
          uploaded_at,
          public_since,
          is_public,
          document_type,
          document_date,
          department,
          classification_level
        FROM files 
        ${fallbackWhereClause}
        ORDER BY uploaded_at DESC
        LIMIT $${fallbackParams.length + 1} OFFSET $${fallbackParams.length + 2}
      `;
      
      const fallbackMainParams = [...fallbackParams, limit, offset];
      
      const fallbackResult = await query(fallbackQuery, fallbackMainParams);
      
      const fallbackFiles = fallbackResult.rows.map(file => ({
        id: file.id.toString(),
        original_name: file.original_name,
        filename: file.filename,
        description: file.description,
        file_size: file.file_size,
        formatted_size: formatFileSize(file.file_size),
        file_type: determineFileType(file.original_name, file.filetype),
        filepath: file.filepath,
        user_id: file.user_id,
        owner_name: file.owner_name,
        owner_email: 'No email available',
        created_at: file.uploaded_at,
        uploaded_at: file.uploaded_at,
        public_since: file.public_since,
        is_public: file.is_public,
        document_type: file.document_type,
        document_date: file.document_date,
        department: file.department,
        classification_level: file.classification_level
      }));
      
      res.json({
        success: true,
        data: {
          files: fallbackFiles,
          pagination: {
            totalFiles: fallbackFiles.length,
            totalPages: Math.ceil(fallbackFiles.length / limit),
            currentPage: page,
            limit: limit
          }
        }
      });
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: error.message
      });
    }
  }
};

export const toggleFileVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;
    
    console.log(`🔄 Toggle visibility for file ${id}: is_public = ${is_public}`);
    
    // Validate input
    if (typeof is_public !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_public must be a boolean value'
      });
    }
    
    // First check if file exists
    const checkResult = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found or you do not have permission'
      });
    }
    
    // Update visibility
    const updateResult = await query(
      `UPDATE files 
       SET is_public = $1, 
           public_since = CASE WHEN $1 = true THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [is_public, id, req.user.userId]
    );
    
    console.log(`✅ File ${id} visibility updated to: ${is_public}`);
    
    const updatedFile = updateResult.rows[0];
    const formattedFile = {
      ...updatedFile,
      id: updatedFile.id.toString(),
      folder_id: updatedFile.folder_id ? updatedFile.folder_id.toString() : null,
      formatted_size: formatFileSize(updatedFile.file_size)
    };
    
    res.json({
      success: true,
      message: is_public ? 'File is now public' : 'File is now private',
      data: {
        file: formattedFile
      }
    });
    
  } catch (error) {
    console.error('❌ Error toggling file visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update file visibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get file visibility status
export const getFileVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`👁️ Get visibility for file ${id}`);
    
    const result = await query(
      'SELECT id, is_public, public_since, user_id FROM files WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = result.rows[0];
    
    // Check ownership
    const isOwner = file.user_id === req.user.userId;
    
    res.json({
      success: true,
      data: {
        id: file.id.toString(),
        is_public: file.is_public,
        public_since: file.public_since,
        can_toggle: isOwner
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting file visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file visibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get advanced category counts with database query
export const getCategoryCounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('📊 Getting advanced category counts for user:', userId);
    
    // Query to get counts by file type groups with file sizes
    const queryText = `
      WITH categorized AS (
        SELECT 
          id,
          filetype,
          file_size,
          CASE 
            WHEN filetype ILIKE '%pdf%' OR 
                 filetype ILIKE '%doc%' OR 
                 filetype ILIKE '%text%' OR 
                 filetype ILIKE '%txt%' OR
                 filetype ILIKE '%msword%' OR
                 filetype ILIKE '%officedocument.wordprocessingml%' THEN 'documents'
            WHEN filetype ILIKE '%image%' OR 
                 filetype ILIKE '%jpg%' OR 
                 filetype ILIKE '%jpeg%' OR 
                 filetype ILIKE '%png%' OR 
                 filetype ILIKE '%gif%' OR
                 filetype ILIKE '%webp%' OR
                 filetype ILIKE '%svg%' THEN 'images'
            WHEN filetype ILIKE '%video%' OR 
                 filetype ILIKE '%mp4%' OR 
                 filetype ILIKE '%mov%' OR 
                 filetype ILIKE '%avi%' OR
                 filetype ILIKE '%mpeg%' OR
                 filetype ILIKE '%quicktime%' THEN 'videos'
            WHEN filetype ILIKE '%audio%' OR 
                 filetype ILIKE '%mp3%' OR 
                 filetype ILIKE '%wav%' OR 
                 filetype ILIKE '%m4a%' OR
                 filetype ILIKE '%aac%' OR
                 filetype ILIKE '%ogg%' THEN 'audio'
            WHEN filetype ILIKE '%zip%' OR 
                 filetype ILIKE '%rar%' OR 
                 filetype ILIKE '%7z%' OR 
                 filetype ILIKE '%tar%' OR
                 filetype ILIKE '%gzip%' OR
                 filetype ILIKE '%compressed%' THEN 'archives'
            WHEN filetype ILIKE '%sheet%' OR 
                 filetype ILIKE '%excel%' OR 
                 filetype ILIKE '%csv%' OR 
                 filetype ILIKE '%xls%' OR
                 filetype ILIKE '%spreadsheet%' OR
                 filetype ILIKE '%officedocument.spreadsheetml%' THEN 'spreadsheets'
            WHEN filetype ILIKE '%presentation%' OR 
                 filetype ILIKE '%powerpoint%' OR 
                 filetype ILIKE '%ppt%' OR
                 filetype ILIKE '%officedocument.presentationml%' THEN 'presentations'
            ELSE 'others'
          END as category
        FROM files 
        WHERE user_id = $1
      )
      SELECT 
        category,
        COUNT(*) as count,
        COALESCE(SUM(file_size), 0) as total_size
      FROM categorized
      GROUP BY category
      ORDER BY count DESC;
    `;
    
    const result = await query(queryText, [userId]);
    
    // Initialize default categories
    const categoryCounts = {
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      spreadsheets: 0,
      presentations: 0,
      others: 0,
      total: 0
    };
    
    const categorySizes = {
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      spreadsheets: 0,
      presentations: 0,
      others: 0,
      total: 0
    };
    
    // Process results
    result.rows.forEach(row => {
      const category = row.category;
      const count = parseInt(row.count) || 0;
      const size = parseInt(row.total_size) || 0;
      
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category] = count;
        categorySizes[category] = size;
      }
      categoryCounts.total += count;
      categorySizes.total += size;
    });
    
    console.log('✅ Advanced category counts:', categoryCounts);
    console.log('📦 Category sizes:', categorySizes);
    
    res.json({
      success: true,
      data: {
        categoryCounts,
        categorySizes,
        totalFiles: categoryCounts.total,
        totalSize: categorySizes.total
      }
    });
    
 } catch (error) {
    console.error('❌ Error getting advanced category counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category counts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Download file
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const fileResult = await query('SELECT * FROM files WHERE id = $1', [id]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = fileResult.rows[0];
    
    // Check permissions: either owner OR file is public
    if (file.user_id !== req.user.userId && !file.is_public) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const filePath = path.join(process.cwd(), file.filepath);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    res.download(filePath, file.original_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
};

// Update file
export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, is_public, document_type, department, owner, classification_level } = req.body;
    
    const result = await query(
      `UPDATE files 
       SET description = $1, is_public = $2, document_type = $3, 
           department = $4, owner = $5, classification_level = $6,
           updated_at = CURRENT_TIMESTAMP,
           public_since = CASE WHEN $2 = true AND public_since IS NULL THEN NOW() ELSE public_since END 
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [description, is_public, document_type, department, owner, classification_level, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const updatedFile = result.rows[0];
    const formattedFile = {
      ...updatedFile,
      id: updatedFile.id.toString(),
      folder_id: updatedFile.folder_id ? updatedFile.folder_id.toString() : null,
      formatted_size: formatFileSize(updatedFile.file_size)
    };
    
    res.json({
      success: true,
      message: 'File updated successfully',
      file: formattedFile
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update file'
    });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file info first
    const fileResult = await query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = fileResult.rows[0];
    const filePath = path.join(process.cwd(), file.filepath);
    
    // Delete from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await query('DELETE FROM files WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      file: {
        id: file.id.toString(),
        original_name: file.original_name,
        folder_id: file.folder_id ? file.folder_id.toString() : null
      }
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};

// Additional endpoints for MyFiles page
export const getFileStats = async (req, res) => {
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
};

export const getDepartments = async (req, res) => {
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
};

export const getSharedWithMe = async (req, res) => {
  try {
    console.log('📂 GET /api/upload/shared - Files shared with user:', req.user.userId);
    
    const result = await query(
      `SELECT f.*, u.name as owner_name, u.email as owner_email
       FROM files f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.is_public = true 
       AND f.user_id != $1
       ORDER BY f.created_at DESC`,
      [req.user.userId]
    );
    
    console.log(`✅ Found ${result.rows.length} files shared with user ${req.user.userId}`);
    
    // Format files
    const formattedFiles = result.rows.map(file => ({
      ...file,
      id: file.id.toString(),
      folder_id: file.folder_id ? file.folder_id.toString() : null,
      formatted_size: formatFileSize(file.file_size),
      file_type: determineFileType(file.original_name, file.filetype)
    }));
    
    res.json({
      success: true,
      files: formattedFiles,
      count: formattedFiles.length
    });
  } catch (error) {
    console.error('❌ Error fetching shared files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Default export for backward compatibility
export default {
  
  getUserFiles,
  getAllUserItems,
  getAllFiles, // Backward compatibility
  getPublicFiles,
  uploadFile,
  moveFile,
  toggleFileVisibility,
  getFileVisibility,
  
  getFileById,
  downloadFile,
  updateFile,
  deleteFile,
  getFileStats,
  getDepartments,
  getSharedWithMe,
  getCategoryCounts,
  searchItems
};