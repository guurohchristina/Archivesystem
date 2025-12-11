import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ShareModal from '../components/ShareModal.jsx';

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Please log in to view your files");
      }

      const response = await fetch(`${API_BASE}/api/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        // Transform API data to the format we need
        const transformedFiles = (result.files || []).map(file => {
          // Determine file type from filename or filetype
          let fileType = "document";
          const fileName = file.original_name?.toLowerCase() || "";
          const fileMime = file.filetype?.toLowerCase() || "";
          
          if (fileName.includes('.pdf') || fileMime.includes('pdf')) fileType = "pdf";
          else if (fileName.includes('.doc') || fileName.includes('.docx') || fileMime.includes('word')) fileType = "doc";
          else if (fileName.includes('.xls') || fileName.includes('.xlsx') || fileName.includes('.csv') || fileMime.includes('excel') || fileMime.includes('sheet')) fileType = "spreadsheet";
          else if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || fileName.includes('.gif') || fileName.includes('.bmp') || fileMime.includes('image')) fileType = "image";
          else if (fileName.includes('.mp4') || fileName.includes('.mov') || fileName.includes('.avi') || fileName.includes('.mkv') || fileMime.includes('video')) fileType = "video";
          else if (fileName.includes('.mp3') || fileName.includes('.wav') || fileName.includes('.aac') || fileMime.includes('audio')) fileType = "audio";
          else if (fileName.includes('.zip') || fileName.includes('.rar') || fileName.includes('.7z') || fileMime.includes('archive') || fileMime.includes('compressed')) fileType = "archive";
          
          // Format relative date
          let relativeDate = "Recently";
          if (file.uploaded_at) {
            const date = new Date(file.uploaded_at);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) relativeDate = "Today";
            else if (diffDays === 1) relativeDate = "Yesterday";
            else if (diffDays < 7) relativeDate = `${diffDays} days ago`;
            else if (diffDays < 30) relativeDate = `${Math.floor(diffDays / 7)} weeks ago`;
            else {
              relativeDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              });
            }
          }
          
          // Format file size
          let formattedSize = "0 Bytes";
          if (file.file_size) {
            const bytes = parseInt(file.file_size);
            if (bytes > 0) {
              const k = 1024;
              const sizes = ["Bytes", "KB", "MB", "GB"];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
            }
          }
          
          return {
            id: file.id,
            name: file.original_name || "Unnamed File",
            type: fileType,
            size: formattedSize,
            date: relativeDate,
            starred: false, // You can implement starring later
            shared: file.is_public || false,
            owner: file.owner || "Unknown",
            department: file.department || "General",
            classification: file.classification_level || "Unclassified",
            description: file.description || "",
            fileSizeBytes: file.file_size || 0,
            uploadedAt: file.uploaded_at,
            documentType: file.document_type,
            isPublic: file.is_public,
            // Keep original API data for download/delete
            _apiData: file
          };
        });
        
        console.log("Transformed files:", transformedFiles);
        setFiles(transformedFiles);
      } else {
        throw new Error(result.message || "Failed to load files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${file._apiData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        alert("File deleted successfully");
        fetchUserFiles(); // Refresh the list
      } else {
        alert(result.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${file._apiData.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const result = await response.json();
        alert(result.message || "Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    }
  };

  const handleShareOpen = (file) => {
    setSelectedFile(file);
    setShareMenuOpen(true);
  };

  const handleShareClose = () => {
    setShareMenuOpen(false);
    setSelectedFile(null);
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: "📄",
      doc: "📝",
      video: "🎬",
      image: "🖼️",
      spreadsheet: "📊",
      archive: "📦",
      audio: "🎵",
    };
    return icons[type] || "📎";
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

  // Calculate total storage used
  const totalStorageUsed = files.reduce((sum, file) => sum + parseInt(file.fileSizeBytes || 0), 0);
  const formatTotalStorage = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Error Loading Files</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchUserFiles}
          style={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Debug info - remove in production */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
      }}>
        Files: {files.length} | API Data loaded
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>My Files</h1>
          <div style={styles.filesStats}>
            <span>{files.length} files • {formatTotalStorage(totalStorageUsed)} used</span>
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <div style={styles.viewControls}>
            <button 
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? '#4285F4' : '#5f6368',
              }}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <span style={{ fontSize: '18px' }}>◼️◼️</span>
            </button>
            <button 
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? '#4285F4' : '#5f6368',
              }}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <span style={{ fontSize: '18px' }}>☰</span>
            </button>
          </div>
          
          <button
            onClick={() => navigate("/upload")}
            style={styles.uploadButton}
          >
            <span style={{ marginRight: '8px' }}>📤</span>
            Upload New File
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Files Grid/List */}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
        overflowX: viewMode === 'list' ? 'hidden' : 'visible'
      }}>
        {filteredFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>📁</span>
            <h3 style={styles.emptyTitle}>
              {files.length === 0 ? "No files uploaded yet" : "No matching files found"}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm 
                ? "Try a different search term." 
                : "Upload your first file to get started."}
            </p>
            <button
              onClick={() => navigate("/upload")}
              style={styles.uploadButton}
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div key={file.id} style={{
              ...styles.fileItem,
              flexDirection: viewMode === 'grid' ? 'column' : 'row',
              alignItems: viewMode === 'grid' ? 'stretch' : 'center',
              minHeight: viewMode === 'grid' ? '200px' : 'auto',
              padding: viewMode === 'grid' ? '16px' : '12px 16px',
              width: viewMode === 'list' ? '100%' : 'auto',
              maxWidth: viewMode === 'list' ? '100%' : 'none',
              boxSizing: 'border-box'
            }}>
              <div style={{
                ...styles.fileIconContainer,
                marginRight: viewMode === 'grid' ? '0' : '16px',
                marginBottom: viewMode === 'grid' ? '12px' : '0',
              }}>
                <span style={styles.fileTypeIcon}>{getFileIcon(file.type)}</span>
                {file.starred && (
                  <span style={styles.fileStar}>
                    ⭐
                  </span>
                )}
                {file.shared && (
                  <span style={styles.fileShared}>
                    🔗
                  </span>
                )}
              </div>
              
              <div style={{
                ...styles.fileInfo,
                flex: viewMode === 'list' ? 1 : 'none',
                minWidth: 0,
                overflow: 'hidden'
              }}>
                <h3 style={{
                  ...styles.fileName,
                  whiteSpace: viewMode === 'list' ? 'nowrap' : 'normal',
                  overflow: viewMode === 'list' ? 'hidden' : 'visible',
                  textOverflow: viewMode === 'list' ? 'ellipsis' : 'clip'
                }}>
                  {file.name}
                </h3>
                <div style={{
                  ...styles.fileMeta,
                  display: 'flex',
                  alignItems: 'center',
                  gap: viewMode === 'list' ? '12px' : '6px',
                  flexWrap: viewMode === 'grid' ? 'wrap' : 'nowrap'
                }}>
                  <span style={{
                    ...styles.fileTypeBadge,
                    background: viewMode === 'list' ? 'none' : '#f1f3f4',
                    padding: viewMode === 'list' ? '0' : '3px 8px',
                    fontSize: viewMode === 'grid' ? '11px' : '12px'
                  }}>
                    {file.type.toUpperCase()}
                  </span>
                  <span style={styles.fileSize}>{file.size}</span>
                  <span style={styles.fileDate}>{file.date}</span>
                </div>
                
                {/* Additional info */}
                <div style={styles.fileDetails}>
                  {file.owner && file.owner !== "Unknown" && (
                    <span style={styles.fileOwner}>
                      {file.owner}
                      {file.department && file.department !== "General" && (
                        <span style={styles.fileDepartment}>
                          • {file.department}
                        </span>
                      )}
                    </span>
                  )}
                  {file.classification && file.classification !== "Unclassified" && (
                    <span style={{
                      ...styles.fileClassification,
                      color: getClassificationColor(file.classification)
                    }}>
                      • {file.classification}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{
                ...styles.fileActions,
                flexDirection: viewMode === 'grid' ? 'row' : 'row',
                gap: viewMode === 'grid' ? '6px' : '8px',
                marginTop: viewMode === 'grid' ? 'auto' : '0',
                marginLeft: viewMode === 'list' ? '12px' : '0'
              }}>
                <button 
                  onClick={() => {
                    const updatedFiles = files.map(f => 
                      f.id === file.id ? { ...f, starred: !f.starred } : f
                    );
                    setFiles(updatedFiles);
                  }}
                  style={{
                    ...styles.actionBtn,
                    color: file.starred ? '#FFD700' : '#5f6368',
                    width: viewMode === 'grid' ? '32px' : '36px',
                    height: viewMode === 'grid' ? '32px' : '36px',
                    fontSize: viewMode === 'grid' ? '14px' : '16px'
                  }}
                  title={file.starred ? "Unstar" : "Star"}
                >
                  {file.starred ? '★' : '☆'}
                </button>
                <button 
                  onClick={() => handleShareOpen(file)}
                  style={{
                    ...styles.actionBtn,
                    color: file.shared ? '#4285F4' : '#5f6368',
                    width: viewMode === 'grid' ? '32px' : '36px',
                    height: viewMode === 'grid' ? '32px' : '36px',
                    fontSize: viewMode === 'grid' ? '14px' : '16px'
                  }}
                  title={file.shared ? "Shared" : "Share"}
                >
                  🔗
                </button>
                <button 
                  onClick={() => handleDownload(file)}
                  style={{
                    ...styles.actionBtn,
                    width: viewMode === 'grid' ? '32px' : '36px',
                    height: viewMode === 'grid' ? '32px' : '36px',
                    fontSize: viewMode === 'grid' ? '14px' : '16px'
                  }}
                  title="Download"
                >
                  ⬇️
                </button>
                <button 
                  onClick={() => handleDelete(file)}
                  style={{
                    ...styles.actionBtn,
                    color: '#ea4335',
                    width: viewMode === 'grid' ? '32px' : '36px',
                    height: viewMode === 'grid' ? '32px' : '36px',
                    fontSize: viewMode === 'grid' ? '14px' : '16px'
                  }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerStats}>
          Showing {filteredFiles.length} of {files.length} files
          {searchTerm && (
            <span style={styles.filteredText}> • Filtered</span>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        file={selectedFile}
        isOpen={shareMenuOpen}
        onClose={handleShareClose}
      />
    </div>
  );
};

// Keep your existing styles object (same as before)
const styles = {
  pageContainer: {
    flex: 1,
    padding: '20px',
    overflowX: 'hidden',
    width:'100%',
    maxWidth: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
    minWidth: '200px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 4px 0',
  },
  filesStats: {
    fontSize: '14px',
    color: '#5f6368',
  },
  viewControls: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#f8f9fa',
    padding: '4px',
    borderRadius: '8px',
    /*border: '1px solid #dadce0',*/
    border:'1px solid red'
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    background: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  },
  uploadButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  searchSection: {
    marginBottom: '20px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: '8px',
    padding: '10px 16px',
  },
  searchIcon: {
    marginRight: '10px',
    fontSize: '16px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: '#202124',
    outline: 'none',
    minWidth: 0,
  },
  filesContainer: {
    gap: '12px',
    width:'100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    border:'1px solid green'
  
  },
  fileItem: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    display: 'flex',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderColor: '#4285F4',
    
  
    },
  },
  fileIconContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    border:'1px solid red'
  
  },
  fileTypeIcon: {
    fontSize: '32px',
  },
  fileStar: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    fontSize: '12px',
    color: '#FFD700',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '1px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  fileShared: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    fontSize: '10px',
    color: '#4285F4',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '1px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  fileInfo: {
    minWidth: 0,
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  fileMeta: {
    marginBottom: '4px',
  },
  fileTypeBadge: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#4285F4',
    borderRadius: '10px',
  },
  fileSize: {
    fontSize: '12px',
    color: '#5f6368',
  },
  fileDate: {
    fontSize: '12px',
    color: '#5f6368',
  },
  fileDetails: {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '4px',
  },
  fileOwner: {
    fontWeight: '500',
  },
  fileDepartment: {
    color: '#34A853',
    marginLeft: '4px',
  },
  fileClassification: {
    fontWeight: '500',
    marginLeft: '4px',
  },
  fileActions: {
    display: 'flex',
    flexShrink: 0,
    border:'1px solid red',
    alignItems:'center'
  
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    /*border: '1px solid #dadce0',*/
    border:'1px solid red',
  
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#5f6368',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      borderColor: '#4285F4',
      color: '#4285F4',
    },
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: 'white',
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    textAlign: 'center',
    gridColumn: '1 / -1',
    marginTop: '20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    margin: '16px 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0 0 20px 0',
    maxWidth: '300px',
  },
  footer: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  footerStats: {
    fontSize: '14px',
    color: '#5f6368',
    textAlign: 'center',
  },
  filteredText: {
    color: '#4285F4',
    fontStyle: 'italic',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #4285F4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#5f6368',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#dc2626',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#991b1b',
    margin: '0 0 8px 0',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#b91c1c',
    margin: '0 0 20px 0',
    maxWidth: '400px',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default MyFiles;