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

  {/*const handleUpload = async (e) => {
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
            navigate(`/my-files/folder/${folderId}`);
          } else {
            navigate('/my-files');
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
  };
  */}
  
  
  
  
  
  
  const handleUpload = async (e) => {
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
  
  // Add folder_id if we're in a folder
  if (folderId && folderId !== 'root') {
    formData.append('folder_id', folderId);
    console.log(`📁 Uploading to folder: ${folderId}`);
  } else {
    // Upload to root (no folder_id or folder_id='root')
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
      folderId: folderId || 'root'
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
      throw new Error('Invalid server response.');
    }

    setUploadResponse(result);
    
    if (response.ok && result.success) {
      setUploadSuccess(true);
      
      // ✅ FIXED: Success - redirect after delay
      setTimeout(() => {
        resetForm();
        
        // Check where to navigate based on where we uploaded from
        if (folderId && folderId !== 'root') {
          // We uploaded from inside a folder - go back to that folder
          navigate(`/my-files/folder/${folderId}`);
        } else {
          // We uploaded from root - go back to MyFiles page
          // Check which route your MyFiles page uses:
          navigate('/my-files'); // If your MyFiles page is at /files
          // OR
          // navigate('/myfiles'); // If your MyFiles page is at /myfiles
        }
      }, 1500); // Reduced delay
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