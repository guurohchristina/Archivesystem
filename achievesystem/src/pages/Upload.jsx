import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
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
    
    // Auto-set owner to current user's name
    if (user?.name && !owner) {
      setOwner(user.name);
    }
  };

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

      const API_URL = 'http://localhost:3000';
      
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
      } catch {
        throw new Error('Invalid server response.');
      }

      setUploadResponse(result);
      
      if (response.ok && result.success) {
        setUploadSuccess(true);
        
        // Success - redirect after delay
        setTimeout(() => {
          resetForm();
          navigate('/my-files');
        }, 2000);
      } else {
        throw new Error(result.message || `Upload failed with status: ${response.status}`);
      }
      
    } catch (error) {
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
          }}>Upload Files</h1>
          <p style={{
            fontSize: isMobile ? '14px' : '15px',
            color: '#5f6368',
            margin: 0,
          }}>Upload documents to the archive system</p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          width: isMobile ? '100%' : 'auto',
        }}>
          <button
            onClick={() => navigate('/myfiles')}
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
              '&:hover': {
                backgroundColor: '#f1f3f4',
              },
            }}
          >
            ← Back to My Files
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
              }}>Redirecting to My Files...</p>
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

      {/* Main Content */}
      <div style={containerStyle}>
        {/* Left Column - File Selection */}
        <div style={leftColumnStyle}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '25px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#202124',
                margin: 0,
              }}>1. Select Files</h2>
              <span style={{
                fontSize: isMobile ? '12px' : '14px',
                color: '#5f6368',
                backgroundColor: '#f1f3f4',
                padding: '4px 12px',
                borderRadius: '20px',
              }}>{selectedFiles.length} selected</span>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp3,.mp4,.zip"
              style={{ display: 'none' }}
            />
            
            {/* Drop Zone */}
            <div 
              style={{
                border: '2px dashed #dadce0',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                minHeight: selectedFiles.length > 0 ? '100px' : '200px',
                backgroundColor: selectedFiles.length > 0 ? '#f0f7ff' : '#f8f9fa',
                borderColor: selectedFiles.length > 0 ? '#4285F4' : '#dadce0',
                overflow: 'hidden',
              }}
              onClick={triggerFileInput}
            >
              {selectedFiles.length > 0 ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ flex: 1, maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #f1f3f4',
                        backgroundColor: 'white',
                        '&:last-child': { borderBottom: 'none' },
                      }}>
                        <div style={{ fontSize: '20px', marginRight: '12px' }}>
                          {getFileIcon(file.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#202124',
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>{file.name}</div>
                          <div style={{ fontSize: '12px', color: '#5f6368' }}>
                            {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ea4335',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            flexShrink: 0,
                          }}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      style={{
                        padding: isMobile ? '10px 12px' : '10px 16px',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: '#3367d6',
                        },
                      }}
                    >
                      + Add More
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllFiles();
                      }}
                      style={{
                        padding: isMobile ? '10px 12px' : '10px 16px',
                        backgroundColor: '#fce8e6',
                        color: '#ea4335',
                        border: '1px solid #fadbd8',
                        borderRadius: '8px',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: '#fadbd8',
                        },
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.7 }}>📁</div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: '#202124', margin: '0 0 8px 0' }}>
                    Click to select files
                  </p>
                  <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 4px 0' }}>
                    Supports multiple files (PDF, Word, Excel, Images, etc.)
                  </p>
                  <p style={{ fontSize: '12px', color: '#9aa0a6', margin: 0 }}>Max 50MB per file</p>
                </div>
              )}
            </div>
            
            {/* File Summary */}
            {selectedFiles.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #f1f3f4',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#5f6368', marginBottom: '4px' }}>Total files:</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#202124' }}>{selectedFiles.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#5f6368', marginBottom: '4px' }}>Total size:</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#202124' }}>{formatFileSize(totalFileSize)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {uploading && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: isMobile ? '20px' : '25px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginTop: '20px',
            }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#202124',
                margin: '0 0 16px 0',
              }}>Upload Progress</h3>
              <div>
                <div style={{
                  height: '12px',
                  backgroundColor: '#f1f3f4',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}>
                  <div 
                    style={{
                      height: '100%',
                      backgroundColor: '#4285F4',
                      width: `${uploadProgress}%`,
                      transition: 'width 0.3s',
                      position: 'relative',
                    }}
                  >
                    <span style={{
                      fontSize: '10px',
                      color: 'white',
                      fontWeight: '600',
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}>{uploadProgress}%</span>
                  </div>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#5f6368',
                  textAlign: 'center',
                  margin: 0,
                }}>
                  {uploadProgress < 100 ? "Uploading files..." : "Processing..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Form */}
        <div style={rightColumnStyle}>
          <form onSubmit={handleUpload} style={{ width: '100%' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: isMobile ? '20px' : '25px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#202124',
                margin: '0 0 20px 0',
              }}>2. Document Information</h2>
              
              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '8px',
                }}>Description *</label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Describe the contents of these files..."
                  rows="3"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <small style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginTop: '6px' }}>
                  This description applies to all uploaded files
                </small>
              </div>
              
              {/* Document Type & Date */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '20px',
                marginBottom: '20px',
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#202124',
                    marginBottom: '8px',
                  }}>Document Type *</label>
                  <select 
                    value={documentType} 
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select type...</option>
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#202124',
                    marginBottom: '8px',
                  }}>Document Date</label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                    }}
                  />
                  <small style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginTop: '6px' }}>
                    Optional
                  </small>
                </div>
              </div>
              
              {/* Department & Owner */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '20px',
                marginBottom: '20px',
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#202124',
                    marginBottom: '8px',
                  }}>Department</label>
                  <select 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <small style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginTop: '6px' }}>
                    Optional
                  </small>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#202124',
                    marginBottom: '8px',
                  }}>Owner *</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Document owner"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              
              {/* Classification & Privacy */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '20px',
                marginBottom: '20px',
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#202124',
                    marginBottom: '8px',
                  }}>Classification Level *</label>
                  <select 
                    value={classificationLevel} 
                    onChange={(e) => setClassificationLevel(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      color: getClassificationColor(classificationLevel),
                      fontWeight: '600',
                    }}
                  >
                    {classificationLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#202124',
                    marginBottom: '8px',
                  }}>Visibility</label>
                  <div style={{ paddingTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '6px' }}>
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#202124' }}>Make files public</span>
                    </label>
                    <small style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginTop: '6px' }}>
                      {isPublic ? 'Files will be visible to other users' : 'Files will be private'}
                    </small>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px solid #f1f3f4',
              }}>
                <button 
                  type="button" 
                  onClick={resetForm}
                  disabled={uploading}
                  style={{
                    padding: isMobile ? '14px 20px' : '14px 24px',
                    backgroundColor: '#f8f9fa',
                    color: '#5f6368',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'all 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box',
                  }}
                >
                  Clear Form
                </button>
                
                <button 
                  type="submit" 
                  disabled={uploading || selectedFiles.length === 0}
                  style={{
                    padding: isMobile ? '14px 20px' : '14px 24px',
                    backgroundColor: selectedFiles.length === 0 ? '#e0e0e0' : '#4285F4',
                    color: selectedFiles.length === 0 ? '#9e9e9e' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    cursor: selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box',
                  }}
                >
                  {uploading ? (
                    <>
                      <div style={{
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        animation: 'spin 1s linear infinite',
                      }}></div>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
            
            {/* User Info Card */}
            <div style={{
              backgroundColor: '#f0f7ff',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #d2e3fc',
              marginTop: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#4285F4',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '18px',
                }}>
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#202124', marginBottom: '2px' }}>
                    {user?.name || "User"}
                  </div>
                  <div style={{ fontSize: '14px', color: '#5f6368' }}>{user?.email || ""}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #d2e3fc', paddingTop: '16px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#202124', marginBottom: '4px' }}>
                    {selectedFiles.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f6368' }}>Files Selected</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#202124', marginBottom: '4px' }}>
                    {formatFileSize(totalFileSize)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f6368' }}>Total Size</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default Upload;