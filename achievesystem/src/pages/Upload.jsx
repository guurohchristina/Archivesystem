import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, useSearchParams } from "react-router-dom"; // Add useSearchParams

const Upload = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Get URL parameters
  
  // File state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Document metadata state
  const [fileDescription, setFileDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [department, setDepartment] = useState("");
  const [owner, setOwner] = useState(user?.name || "");
  const [classificationLevel, setClassificationLevel] = useState("Unclassified");
  
  // Get folder_id from URL parameters
  const folderId = searchParams.get("folder");
  
  // Predefined options
  const documentTypes = [
    "", // Empty option
    "Report", "Memo", "Contract", "Invoice", "Certificate", 
    "Policy", "Procedure", "Form", "Presentation", "Spreadsheet",
    "Image", "Video", "Audio", "Email", "Other"
  ];
  
  const departments = [
    "", // Empty option
    "Administration", "Finance", "Human Resources", "IT", "Legal",
    "Marketing", "Operations", "Procurement", "Sales", "Research & Development"
  ];
  
  const classificationLevels = [
    "Unclassified",
    "Confidential", 
    "Secret", 
    "Top Secret"
  ];
  
  const fileInputRef = useRef(null);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set owner from user context
  useEffect(() => {
    if (user?.name && !owner) {
      setOwner(user.name);
    }
  }, [user]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`File "${file.name}" is too large (max 50MB)`);
        return false;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/zip',
        'audio/mpeg',
        'video/mp4'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" has an unsupported type.`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setUploadError("");
  };

 {/* const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setUploadError("Please select at least one file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess(false);
    setUploadResponse(null);

    const formData = new FormData();
    
    // Append files
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    
    // Append metadata
    formData.append('description', fileDescription);
    formData.append('is_public', isPublic.toString());
    formData.append('document_type', documentType);
    formData.append('document_date', documentDate);
    formData.append('department', department);
    formData.append('owner', owner);
    formData.append('classification_level', classificationLevel);
    
    // Add folder_id if present
    if (folderId) {
      formData.append('folder_id', folderId);
      console.log(`📁 Uploading to folder: ${folderId}`);
    } else {
      // If no folder_id, upload to root
      formData.append('folder_id', 'root');
      console.log('📁 Uploading to root folder');
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login again to upload files.');
      }

      const API_URL = 'https://archivesystembackend.onrender.com';
      
      console.log('📤 Uploading files...', {
        fileCount: selectedFiles.length,
        folderId: folderId || 'root',
        formDataEntries: Array.from(formData.entries())
      });
      
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const responseText = await response.text();
      
      // Check if it's HTML error page
      const isHtml = responseText.includes('<!DOCTYPE') || 
                     responseText.includes('<html');
      
      if (isHtml) {
        throw new Error('Server error occurred. Please try again.');
      }

      // Parse JSON response
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('📥 Upload response:', result);
      } catch {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid server response.');
      }

      setUploadResponse(result);
      
      if (response.ok && result.success) {
        setUploadSuccess(true);
        
        // Success - redirect after delay
        setTimeout(() => {
          resetForm();
          // Navigate back to the folder or root
          if (folderId) {
            navigate(`/files/folder/${folderId}`);
          } else {
            navigate('/files');
          }
        }, 2000);
      } else {
        throw new Error(result.message || `Upload failed with status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };*/}
  
  
  export const uploadFile = async (req, res) => {
  console.log('📤 ========= UPLOAD FILE REQUEST STARTED =========');
  
  try {
    console.log('📋 Request body fields:', Object.keys(req.body));
    console.log('📋 Request files:', req.files ? req.files.length : 'No files');
    
    const files = req.files;
    
    if (!files || files.length === 0) {
      console.log('❌ No files in request');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    console.log('📄 File details:');
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
      console.log(`     Saved as: ${file.filename}`);
      console.log(`     Path: ${file.path}`);
    });

    const userId = req.user.userId;
    console.log('👤 User ID:', userId);

    const {
      description = '',
      is_public = 'false',
      document_type = '',
      document_date = null,
      department = '',
      owner = '',
      classification_level = 'Unclassified',
      folder_id = 'root'
    } = req.body;

    console.log('📋 Request body parameters:');
    console.log('   description:', description);
    console.log('   is_public:', is_public);
    console.log('   document_type:', document_type);
    console.log('   document_date:', document_date);
    console.log('   department:', department);
    console.log('   owner:', owner);
    console.log('   classification_level:', classification_level);
    console.log('   folder_id:', folder_id);

    const uploadResults = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      console.log(`\n💾 ========= PROCESSING FILE: ${file.originalname} =========`);
      
      try {
        // Determine folder_id value
        let finalFolderId = null;
        if (folder_id && folder_id !== 'root') {
          const parsedFolderId = parseInt(folder_id);
          if (isNaN(parsedFolderId)) {
            console.log(`⚠️ Invalid folder_id format: "${folder_id}", using null (root)`);
            finalFolderId = null;
          } else {
            finalFolderId = parsedFolderId;
            console.log(`📁 Uploading to folder ID: ${finalFolderId}`);
          }
        } else {
          console.log('📁 Uploading to root folder (null)');
        }

        // Parse boolean value for is_public
        const isPublicBool = is_public === 'true' || is_public === true || is_public === '1';
        console.log('   Parsed is_public:', isPublicBool);
        
        // Prepare SQL parameters - MATCHING YOUR TABLE COLUMN NAMES
        const params = [
          userId,                    // $1: user_id
          file.originalname,         // $2: original_name
          file.filename,             // $3: filename (not file_name)
          file.path,                 // $4: filepath (not file_path)
          file.size,                 // $5: file_size
          file.mimetype,             // $6: filetype
          description || '',         // $7: description
          isPublicBool,              // $8: is_public
          document_type || '',       // $9: document_type
          document_date || null,     // $10: document_date
          department || '',          // $11: department
          owner || '',               // $12: owner
          classification_level || 'Unclassified', // $13: classification_level
          finalFolderId              // $14: folder_id (null for root)
        ];

        console.log('📊 SQL Parameters:');
        const paramNames = [
          'user_id', 'original_name', 'filename', 'filepath', 'file_size',
          'filetype', 'description', 'is_public', 'document_type', 'document_date',
          'department', 'owner', 'classification_level', 'folder_id'
        ];
        params.forEach((param, index) => {
          console.log(`   $${index + 1} (${paramNames[index]}):`, param, `(${typeof param})`);
        });

        // Check if file already exists with same name in same folder
        try {
          const duplicateCheck = await query(
            'SELECT id FROM files WHERE user_id = $1 AND original_name = $2 AND (folder_id IS NOT DISTINCT FROM $3)',
            [userId, file.originalname, finalFolderId]
          );
          
          if (duplicateCheck.rows.length > 0) {
            console.log(`⚠️ File "${file.originalname}" already exists in this folder. Skipping.`);
            uploadResults.push({
              error: true,
              filename: file.originalname,
              message: 'File with this name already exists in the folder'
            });
            continue; // Skip to next file
          }
        } catch (duplicateError) {
          console.log('⚠️ Could not check for duplicates:', duplicateError.message);
          // Continue anyway
        }

        console.log('🚀 Executing INSERT query...');
        
        // UPDATED SQL to match your column names
        const sql = `
          INSERT INTO files (
            user_id, original_name, filename, filepath, file_size, filetype, 
            description, is_public, document_type, document_date, department, 
            owner, classification_level, folder_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *
        `;
        
        console.log('📝 SQL Query:', sql);
        
        const result = await query(sql, params);
        console.log('✅ Database insert successful!');
        
        const uploadedFile = result.rows[0];
        console.log('📋 Inserted file data:', {
          id: uploadedFile.id,
          original_name: uploadedFile.original_name,
          filename: uploadedFile.filename,
          folder_id: uploadedFile.folder_id
        });
        
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
        
        console.log(`✅ File "${file.originalname}" uploaded successfully!`);

      } catch (fileError) {
        console.error(`❌ Error processing file "${file.originalname}":`, fileError.message);
        console.error('File error stack:', fileError.stack);
        console.error('File error code:', fileError.code);
        console.error('File error detail:', fileError.detail);
        console.error('File error hint:', fileError.hint);
        
        errors.push({
          filename: file.originalname,
          error: fileError.message,
          code: fileError.code,
          detail: fileError.detail,
          hint: fileError.hint
        });
        
        uploadResults.push({
          error: true,
          filename: file.originalname,
          message: fileError.message,
          code: fileError.code
        });
      }
    }

    console.log('\n📊 ========= UPLOAD SUMMARY =========');
    console.log(`Total files attempted: ${files.length}`);
    
    const successfulUploads = uploadResults.filter(r => !r.error);
    const failedUploads = uploadResults.filter(r => r.error);
    
    console.log(`Successful uploads: ${successfulUploads.length}`);
    console.log(`Failed uploads: ${failedUploads.length}`);
    
    if (errors.length > 0) {
      console.log('❌ Errors encountered:');
      errors.forEach(err => {
        console.log(`  - ${err.filename}: ${err.error}`);
        console.log(`    Code: ${err.code}, Detail: ${err.detail}`);
      });
    }

    // Check if any files were successfully uploaded
    if (successfulUploads.length === 0 && uploadResults.length > 0) {
      console.log('❌ All files failed to upload');
      return res.status(500).json({
        success: false,
        message: 'All files failed to upload',
        detailed_errors: errors,
        error_summary: errors.map(err => `${err.filename}: ${err.error} (Code: ${err.code})`)
      });
    }

    const response = {
      success: true,
      message: `${successfulUploads.length} file(s) uploaded successfully`,
      files: successfulUploads
    };

    // Include error details if some files failed
    if (failedUploads.length > 0) {
      response.partial_success = true;
      response.failed_files = failedUploads;
      response.message += ` (${failedUploads.length} failed)`;
      response.errors = errors;
    }

    console.log('📤 Sending response to client...');
    console.log('Response summary:', {
      success: response.success,
      message: response.message,
      successful_files: response.files.length,
      failed_files: response.failed_files ? response.failed_files.length : 0
    });

    res.json(response);

  } catch (error) {
    console.error('❌ ========= UPLOAD FILE FAILED =========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Error stack:', error.stack);
    
    console.error('Request details:', {
      method: req.method,
      url: req.originalUrl,
      user_id: req.user?.userId,
      files_count: req.files?.length || 0
    });

    // Try to get more specific error message
    let errorMessage = 'Failed to upload files. Please try again.';
    let statusCode = 500;

    if (error.code === '23505') { // Unique violation
      errorMessage = 'A file with this name already exists in the folder.';
      statusCode = 400;
    } else if (error.code === '23503') { // Foreign key violation
      errorMessage = 'Invalid folder ID. The folder does not exist.';
      statusCode = 400;
    } else if (error.code === '23502') { // Not null violation
      errorMessage = 'Missing required fields.';
      statusCode = 400;
    } else if (error.code === '42703') { // Undefined column
      errorMessage = 'Database column error. Please check table structure.';
      statusCode = 500;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error_details: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      } : undefined
    });
  } finally {
    console.log('🏁 ========= UPLOAD FILE REQUEST COMPLETED =========\n');
  }
};
  
  
  
  
  

  const resetForm = () => {
    setSelectedFiles([]);
    setFileDescription("");
    setIsPublic(false);
    setDocumentType("");
    setDocumentDate("");
    setDepartment("");
    setOwner(user?.name || "");
    setClassificationLevel("Unclassified");
    setUploadError("");
    setUploadSuccess(false);
    setUploadResponse(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };  

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) return '📊';
    if (fileType.includes('video')) return '🎬';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    return '📎';
  };

  const getClassificationColor = (level) => {
    const colors = {
      "Top Secret": "#dc2626",
      "Secret": "#ea580c",
      "Confidential": "#ca8a04",
      "Unclassified": "#16a34a",
      "Public": "#3b82f6",
    };
    return colors[level] || "#6b7280";
  };

  const totalFileSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  // Dynamic styles based on screen size
  const containerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '20px' : '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    alignItems: 'flex-start',
  };

  const leftColumnStyle = {
    flex: 1,
    width: isMobile ? '100%' : '500px',
    position: isMobile ? 'static' : 'sticky',
    top: isMobile ? 'auto' : '20px',
  };

  const rightColumnStyle = {
    flex: 1,
    width: '100%',
    maxWidth: isMobile ? '100%' : '600px',
  };

  return (
    <div style={{
      flex: 1,
      padding: isMobile ? '16px' : '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: '30px',
        gap: isMobile ? '12px' : '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: '#202124',
            margin: '0 0 4px 0',
          }}>
            {folderId ? 'Upload to Folder' : 'Upload Files'}
          </h1>
          <p style={{
            fontSize: isMobile ? '14px' : '15px',
            color: '#5f6368',
            margin: 0,
          }}>
            {folderId 
              ? 'Upload documents to the current folder' 
              : 'Upload documents to the archive system'}
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          width: isMobile ? '100%' : 'auto',
        }}>
          <button
            onClick={() => {
              if (folderId) {
                navigate(`/files/folder/${folderId}`);
              } else {
                navigate('/files');
              }
            }}
            style={{
              padding: isMobile ? '10px 16px' : '10px 20px',
              backgroundColor: '#f8f9fa',
              color: '#5f6368',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              flex: isMobile ? 1 : 'auto',
              width: isMobile ? '100%' : 'auto',
              ':hover': {
                backgroundColor: '#f1f3f4',
              },
            }}
          >
            ← {folderId ? 'Back to Folder' : 'Back to My Files'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <span style={{ fontSize: '24px', color: '#155724' }}>✅</span>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                color: '#155724',
                margin: '0 0 4px 0',
              }}>
                {uploadResponse?.files?.length === 1 
                  ? 'File uploaded successfully!' 
                  : `${uploadResponse?.files?.length || selectedFiles.length} files uploaded successfully!`}
              </h3>
              <p style={{
                fontSize: isMobile ? '13px' : '14px',
                color: '#155724',
                margin: 0,
                opacity: 0.8,
              }}>
                {folderId 
                  ? 'Redirecting back to folder...' 
                  : 'Redirecting to My Files...'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {uploadError && (
        <div style={{
          backgroundColor: '#fce8e6',
          border: '1px solid #fadbd8',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <span style={{ fontSize: '24px', color: '#c5221f' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                color: '#c5221f',
                margin: '0 0 4px 0',
              }}>Upload Failed</h3>
              <p style={{
                fontSize: isMobile ? '13px' : '14px',
                color: '#c5221f',
                margin: 0,
                opacity: 0.8,
              }}>{uploadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div style={{
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}>
            <span style={{
              fontSize: '14px',
              color: '#5f6368',
              fontWeight: '500',
            }}>Uploading...</span>
            <span style={{
              fontSize: '14px',
              color: '#4285F4',
              fontWeight: '500',
            }}>{uploadProgress}%</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: '#e8f0fe',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              backgroundColor: '#4285F4',
              transition: 'width 0.3s ease',
            }}></div>
          </div>
        </div>
      )}

      <div style={containerStyle}>
        {/* Left Column: File Selection */}
        <div style={leftColumnStyle}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            padding: isMobile ? '16px' : '20px',
            marginBottom: '20px',
          }}>
            <h2 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#202124',
              margin: '0 0 16px 0',
            }}>Select Files</h2>
            
            {/* File Drop Zone */}
            <div
              onClick={triggerFileInput}
              style={{
                border: '2px dashed #dadce0',
                borderRadius: '12px',
                padding: isMobile ? '40px 20px' : '60px 40px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#f8f9fa',
                marginBottom: '20px',
                ':hover': {
                  borderColor: '#4285F4',
                  backgroundColor: '#f1f3f4',
                },
              }}
            >
              <div style={{
                fontSize: isMobile ? '36px' : '48px',
                color: '#5f6368',
                marginBottom: '12px',
              }}>
                📤
              </div>
              <p style={{
                fontSize: isMobile ? '14px' : '16px',
                color: '#202124',
                fontWeight: '500',
                margin: '0 0 6px 0',
              }}>
                Click to browse or drag & drop files
              </p>
              <p style={{
                fontSize: isMobile ? '12px' : '13px',
                color: '#5f6368',
                margin: 0,
              }}>
                Maximum file size: 50MB per file
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                style={{ display: 'none' }}
              />
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#202124',
                    margin: 0,
                  }}>
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <button
                    onClick={clearAllFiles}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#ea4335',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      ':hover': {
                        backgroundColor: '#fce8e6',
                      },
                    }}
                  >
                    Clear All
                  </button>
                </div>
                
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{
                        fontSize: '20px',
                        marginRight: '12px',
                      }}>
                        {getFileIcon(file.type)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#202124',
                          margin: '0 0 4px 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {file.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#5f6368',
                          margin: 0,
                        }}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ea4335',
                          cursor: 'pointer',
                          fontSize: '18px',
                          padding: '4px',
                        }}
                        title="Remove file"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#e8f0fe',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#4285F4',
                    margin: 0,
                    fontWeight: '500',
                  }}>
                    Total: {formatFileSize(totalFileSize)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Form */}
        <div style={rightColumnStyle}>
          <form onSubmit={handleUpload}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              padding: isMobile ? '16px' : '20px',
            }}>
              <h2 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#202124',
                margin: '0 0 20px 0',
              }}>File Information</h2>
              
              {/* Folder Info (if uploading to folder) */}
              {folderId && (
                <div style={{
                  backgroundColor: '#e8f0fe',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{ fontSize: '20px' }}>📁</span>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4285F4',
                      margin: '0 0 2px 0',
                    }}>Uploading to Folder</p>
                    <p style={{
                      fontSize: '12px',
                      color: '#5f6368',
                      margin: 0,
                    }}>Files will be saved in the current folder</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '8px',
                }}>
                  Description
                </label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Enter a description for the files"
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#4285F4',
                      boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
                    },
                  }}
                />
              </div>

              {/* Owner */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '8px',
                }}>
                  Owner
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Enter owner name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#4285F4',
                      boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
                    },
                  }}
                />
              </div>

              {/* Department */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '8px',
                }}>
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#4285F4',
                      boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
                    },
                  }}
                >
                  {departments.map((dept) => (
                    <option key={dept || "empty"} value={dept}>
                      {dept || "Select department"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '8px',
                }}>
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#4285F4',
                      boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
                    },
                  }}
                >
                  {documentTypes.map((type) => (
                    <option key={type || "empty"} value={type}>
                      {type || "Select document type"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Date */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '8px',
                }}>
                  Document Date
                </label>
                <input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#4285F4',
                      boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
                    },
                  }}
                />
              </div>

              {/* Classification Level */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '8px',
                }}>
                  Classification Level
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  {classificationLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setClassificationLevel(level)}
                      style={{
                        flex: 1,
                        minWidth: '100px',
                        padding: '10px',
                        border: `2px solid ${getClassificationColor(level)}`,
                        backgroundColor: classificationLevel === level ? getClassificationColor(level) : 'white',
                        color: classificationLevel === level ? 'white' : getClassificationColor(level),
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Public Access Toggle */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                    }}
                  />
                  <div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#202124',
                    }}>
                      Make files publicly accessible
                    </span>
                    <p style={{
                      fontSize: '12px',
                      color: '#5f6368',
                      margin: '4px 0 0 0',
                    }}>
                      Anyone with the link can view/download these files
                    </p>
                  </div>
                </label>
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: uploading || selectedFiles.length === 0 ? '#f1f3f4' : '#4285F4',
                  color: uploading || selectedFiles.length === 0 ? '#9aa0a6' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {uploading ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` : 'Files'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;