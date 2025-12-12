import { useState, useContext, useRef } from "react";
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
          navigate('/myfiles');
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

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Upload Files</h1>
          <p style={styles.subtitle}>Upload documents to the archive system</p>
        </div>
        
        <div style={styles.headerRight}>
          <button
            onClick={() => navigate('/myfiles')}
            style={styles.backButton}
          >
            ← Back to My Files
          </button>
        </div>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div style={styles.successCard}>
          <div style={styles.successHeader}>
            <span style={styles.successIcon}>✅</span>
            <div style={styles.successText}>
              <h3 style={styles.successTitle}>
                {uploadResponse?.files?.length === 1 
                  ? 'File uploaded successfully!' 
                  : `${uploadResponse?.files?.length || selectedFiles.length} files uploaded successfully!`}
              </h3>
              <p style={styles.successMessage}>Redirecting to My Files...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {uploadError && (
        <div style={styles.errorCard}>
          <div style={styles.errorHeader}>
            <span style={styles.errorIcon}>⚠️</span>
            <div style={styles.errorText}>
              <h3 style={styles.errorTitle}>Upload Failed</h3>
              <p style={styles.errorMessage}>{uploadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div style={styles.container}>
        {/* Left Column - File Selection */}
        <div style={styles.leftColumn}>
          <div style={styles.uploadCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>1. Select Files</h2>
              <span style={styles.cardCounter}>{selectedFiles.length} selected</span>
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
                ...styles.dropZone,
                borderColor: selectedFiles.length > 0 ? '#4285F4' : '#dadce0',
                backgroundColor: selectedFiles.length > 0 ? '#f0f7ff' : '#f8f9fa',
                minHeight: selectedFiles.length > 0 ? '100px' : '200px',
                justifyContent: selectedFiles.length > 0 ? 'flex-start' : 'center',
              }}
              onClick={triggerFileInput}
            >
              {selectedFiles.length > 0 ? (
                <div style={styles.filesList}>
                  <div style={styles.filesContainer}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={styles.fileItem}>
                        <div style={styles.fileIcon}>
                          {getFileIcon(file.type)}
                        </div>
                        <div style={styles.fileInfo}>
                          <div style={styles.fileName}>{file.name}</div>
                          <div style={styles.fileMeta}>
                            {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          style={styles.removeButton}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div style={styles.fileActions}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      style={styles.addButton}
                    >
                      + Add More Files
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllFiles();
                      }}
                      style={styles.clearButton}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyDropZone}>
                  <div style={styles.uploadIcon}>📁</div>
                  <p style={styles.dropZoneText}>Click to select files</p>
                  <p style={styles.dropZoneHint}>
                    Supports multiple files (PDF, Word, Excel, Images, etc.)
                  </p>
                  <p style={styles.dropZoneLimit}>Max 50MB per file</p>
                </div>
              )}
            </div>
            
            {/* File Summary */}
            {selectedFiles.length > 0 && (
              <div style={styles.fileSummary}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Total files:</span>
                  <span style={styles.summaryValue}>{selectedFiles.length}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Total size:</span>
                  <span style={styles.summaryValue}>{formatFileSize(totalFileSize)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar - Fixed position at bottom of left column */}
          {uploading && (
            <div style={styles.progressCard}>
              <h3 style={styles.cardTitle}>Upload Progress</h3>
              <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${uploadProgress}%`
                    }}
                  >
                    <span style={styles.progressText}>{uploadProgress}%</span>
                  </div>
                </div>
                <p style={styles.progressStatus}>
                  {uploadProgress < 100 ? "Uploading files..." : "Processing..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Form (ALWAYS VISIBLE) */}
        <div style={styles.rightColumn}>
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formCard}>
              <h2 style={styles.cardTitle}>2. Document Information</h2>
              
              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Describe the contents of these files..."
                  rows="3"
                  required
                  style={styles.textarea}
                />
                <small style={styles.hint}>This description applies to all uploaded files</small>
              </div>
              
              {/* Document Type & Date */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Document Type *</label>
                  <select 
                    value={documentType} 
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                    style={styles.select}
                  >
                    <option value="">Select type...</option>
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Document Date</label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={styles.input}
                  />
                  <small style={styles.hint}>Optional</small>
                </div>
              </div>
              
              {/* Department & Owner */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Department</label>
                  <select 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <small style={styles.hint}>Optional</small>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Owner *</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Document owner"
                    required
                    style={styles.input}
                  />
                </div>
              </div>
              
              {/* Classification & Privacy */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Classification Level *</label>
                  <select 
                    value={classificationLevel} 
                    onChange={(e) => setClassificationLevel(e.target.value)}
                    required
                    style={{
                      ...styles.select,
                      color: getClassificationColor(classificationLevel),
                      fontWeight: '600'
                    }}
                  >
                    {classificationLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Visibility</label>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>Make files public</span>
                    </label>
                    <small style={styles.hint}>
                      {isPublic ? 'Files will be visible to other users' : 'Files will be private'}
                    </small>
                  </div>
                </div>
              </div>
              
              {/* UPLOAD BUTTON - NOW INSIDE FORM CARD */}
              <div style={styles.actionButtons}>
                <button 
                  type="button" 
                  onClick={resetForm}
                  disabled={uploading}
                  style={styles.cancelButton}
                >
                  Clear Form
                </button>
                
                <button 
                  type="submit" 
                  disabled={uploading || selectedFiles.length === 0}
                  style={selectedFiles.length === 0 ? styles.disabledButton : styles.submitButton}
                >
                  {uploading ? (
                    <>
                      <div style={styles.spinner}></div>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
            
            {/* User Info Card - BELOW FORM */}
            <div style={styles.userCard}>
              <div style={styles.userHeader}>
                <div style={styles.userAvatar}>
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={styles.userName}>{user?.name || "User"}</div>
                  <div style={styles.userEmail}>{user?.email || ""}</div>
                </div>
              </div>
              <div style={styles.userStats}>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{selectedFiles.length}</div>
                  <div style={styles.statLabel}>Files Selected</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{formatFileSize(totalFileSize)}</div>
                  <div style={styles.statLabel}>Total Size</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    overflowX: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#202124',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#5f6368',
    margin: 0,
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#f8f9fa',
    color: '#5f6368',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f1f3f4',
    },
  },
  container: {
    display: 'flex',
    gap: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    maxWidth: '500px',
    position: 'sticky',
    top: '20px',
  },
  rightColumn: {
    flex: 1,
    maxWidth: '600px',
  },
  uploadCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    marginBottom: '20px',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    marginBottom: '20px',
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    marginTop: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    margin: 0,
  },
  cardCounter: {
    fontSize: '14px',
    color: '#5f6368',
    backgroundColor: '#f1f3f4',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  dropZone: {
    border: '2px dashed #dadce0',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '200px',
    overflow: 'hidden',
  },
  emptyDropZone: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.7,
  },
  dropZoneText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  dropZoneHint: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0 0 4px 0',
  },
  dropZoneLimit: {
    fontSize: '12px',
    color: '#9aa0a6',
    margin: 0,
  },
  filesList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  filesContainer: {
    flex: 1,
    maxHeight: '300px',
    overflowY: 'auto',
    marginBottom: '15px',
    border: '1px solid #f1f3f4',
    borderRadius: '8px',
    padding: '5px',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #f1f3f4',
    backgroundColor: 'white',
    transition: 'all 0.2s',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  fileIcon: {
    fontSize: '20px',
    marginRight: '12px',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileMeta: {
    fontSize: '12px',
    color: '#5f6368',
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ea4335',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: '#fce8e6',
    },
  },
  fileActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  addButton: {
    padding: '10px 16px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#3367d6',
    },
  },
  clearButton: {
    padding: '10px 16px',
    backgroundColor: '#fce8e6',
    color: '#ea4335',
    border: '1px solid #fadbd8',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#fadbd8',
    },
  },
  fileSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #f1f3f4',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#5f6368',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#202124',
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: '20px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#4285F4',
      boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.1)',
    },
  },
  textarea: {
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
    '&:focus': {
      borderColor: '#4285F4',
      boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.1)',
    },
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#4285F4',
      boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.1)',
    },
  },
  hint: {
    display: 'block',
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '6px',
  },
  checkboxGroup: {
    paddingTop: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '6px',
  },
  checkbox: {
    marginRight: '10px',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#202124',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f3f4',
  },
  cancelButton: {
    padding: '14px 24px',
    backgroundColor: '#f8f9fa',
    color: '#5f6368',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f1f3f4',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  submitButton: {
    padding: '14px 24px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#3367d6',
    },
  },
  disabledButton: {
    padding: '14px 24px',
    backgroundColor: '#e0e0e0',
    color: '#9e9e9e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'not-allowed',
  },
  spinner: {
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
  },
  successCard: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  successHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  successIcon: {
    fontSize: '24px',
    color: '#155724',
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#155724',
    margin: '0 0 4px 0',
  },
  successMessage: {
    fontSize: '14px',
    color: '#155724',
    margin: 0,
    opacity: 0.8,
  },
  errorCard: {
    backgroundColor: '#fce8e6',
    border: '1px solid #fadbd8',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  errorIcon: {
    fontSize: '24px',
    color: '#c5221f',
  },
  errorText: {
    flex: 1,
  },
  errorTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#c5221f',
    margin: '0 0 4px 0',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#c5221f',
    margin: 0,
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: '16px',
  },
  progressBar: {
    height: '12px',
    backgroundColor: '#f1f3f4',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4285F4',
    transition: 'width 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressText: {
    fontSize: '10px',
    color: 'white',
    fontWeight: '600',
    position: 'absolute',
    right: '8px',
  },
  progressStatus: {
    fontSize: '14px',
    color: '#5f6368',
    textAlign: 'center',
    margin: 0,
  },
  userCard: {
    backgroundColor: '#f0f7ff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #d2e3fc',
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  userAvatar: {
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
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '2px',