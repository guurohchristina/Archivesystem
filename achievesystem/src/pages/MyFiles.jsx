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

  // Sample files data for demonstration - remove this when API is working
  const [demoFiles] = useState([
    { id: 1, name: "Annual Report 2024.pdf", type: "pdf", size: "2.4 MB", date: "Today", starred: true, shared: false, owner: "You", department: "Finance", classification: "Confidential" },
    { id: 2, name: "Project Proposal.docx", type: "doc", size: "1.8 MB", date: "Yesterday", starred: false, shared: true, owner: "John Doe", department: "Marketing", classification: "Unclassified" },
    { id: 3, name: "Team Meeting.mp4", type: "video", size: "45.2 MB", date: "2 days ago", starred: true, shared: false, owner: "You", department: "Operations", classification: "Confidential" },
    { id: 4, name: "Company Logo.png", type: "image", size: "3.1 MB", date: "Nov 12", starred: false, shared: false, owner: "Design Team", department: "Design", classification: "Public" },
    { id: 5, name: "Financial Data.xlsx", type: "spreadsheet", size: "5.7 MB", date: "Nov 10", starred: false, shared: true, owner: "You", department: "Finance", classification: "Secret" },
    { id: 6, name: "Design Assets.zip", type: "archive", size: "125.4 MB", date: "Nov 5", starred: true, shared: false, owner: "Design Team", department: "Design", classification: "Unclassified" },
  ]);

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
        // For demo purposes, use sample data if no token
        console.log("No token found, using demo data");
        setFiles(demoFiles);
        setLoading(false);
        return;
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
        // Transform API data to match our format
        const transformedFiles = (result.files || []).map(file => ({
          id: file.id,
          name: file.original_name,
          type: getFileTypeFromExtension(file.filetype),
          size: formatFileSize(file.file_size),
          date: formatRelativeDate(file.uploaded_at),
          starred: false, // You can add this to your API later
          shared: file.is_public || false,
          owner: file.owner || "Unknown",
          department: file.department || "General",
          classification: file.classification_level || "Unclassified",
          description: file.description,
          fileSizeBytes: file.file_size,
          uploadedAt: file.uploaded_at,
          documentType: file.document_type,
          isPublic: file.is_public
        }));
        
        setFiles(transformedFiles.length > 0 ? transformedFiles : demoFiles);
      } else {
        console.log("API failed, using demo data");
        setFiles(demoFiles);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      console.log("Using demo data due to error");
      setFiles(demoFiles);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get file type from extension
  const getFileTypeFromExtension = (filetype) => {
    if (!filetype) return "document";
    const type = filetype.toLowerCase();
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('doc')) return 'doc';
    if (type.includes('excel') || type.includes('sheet') || type.includes('csv')) return 'spreadsheet';
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) return 'image';
    if (type.includes('video') || type.includes('mp4') || type.includes('mov')) return 'video';
    if (type.includes('audio') || type.includes('mp3') || type.includes('wav')) return 'audio';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'archive';
    return 'document';
  };

  // Helper function to format relative date
  const formatRelativeDate = (dateString) => {
    if (!dateString) return "Recently";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Only call API if we have a token (real data)
      if (token) {
        const response = await fetch(`${API_BASE}/api/upload/${fileId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.success) {
          alert("File deleted successfully");
          fetchUserFiles();
        } else {
          alert(result.message || "Failed to delete file");
        }
      } else {
        // For demo: remove from local state
        setFiles(files.filter(f => f.id !== fileId));
        alert("File deleted (demo mode)");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch(`${API_BASE}/api/upload/${fileId}/download`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const result = await response.json();
          alert(result.message || "Failed to download file");
        }
      } else {
        // Demo mode
        alert(`Downloading ${fileName} (demo mode)`);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>My Files</h1>
          <div style={styles.filesStats}>
            <span>{files.length} files • {formatFileSize(files.reduce((sum, file) => sum + (parseInt(file.fileSizeBytes) || 0), 0))} used</span>
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
            placeholder="Search files by name, owner, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Files Grid/List */}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'flex',
        flexDirection: viewMode === 'list' ? 'column' : 'row',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(250px, 1fr))' : 'none'
      }}>
        {filteredFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>📁</span>
            <h3 style={styles.emptyTitle}>No files found</h3>
            <p style={styles.emptyText}>
              {searchTerm ? "No files match your search." : "You haven't uploaded any files yet."}
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
              alignItems: viewMode === 'grid' ? 'stretch' : 'center'
            }}>
              <div style={styles.fileIconContainer}>
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
              
              <div style={styles.fileInfo}>
                <h3 style={styles.fileName}>{file.name}</h3>
                <div style={{
                  ...styles.fileMeta,
                  display: 'flex',
                  alignItems: 'center',
                  gap: viewMode === 'list' ? '16px' : '8px'
                }}>
                  <span style={{
                    ...styles.fileTypeBadge,
                    background: viewMode === 'list' ? 'none' : '#f1f3f4',
                    padding: viewMode === 'list' ? '0' : '4px 8px'
                  }}>
                    {file.type.toUpperCase()}
                  </span>
                  <span style={styles.fileSize}>{file.size}</span>
                  <span style={styles.fileDate}>{file.date}</span>
                </div>
                
                <div style={styles.fileDetails}>
                  <span style={styles.fileOwner}>
                    {file.owner}
                  </span>
                  {file.department && (
                    <span style={styles.fileDepartment}>
                      • {file.department}
                    </span>
                  )}
                  <span style={{
                    ...styles.fileClassification,
                    color: getClassificationColor(file.classification)
                  }}>
                    • {file.classification}
                  </span>
                </div>
              </div>
              
              <div style={styles.fileActions}>
                <button 
                  onClick={() => {
                    // Toggle star
                    const updatedFiles = files.map(f => 
                      f.id === file.id ? { ...f, starred: !f.starred } : f
                    );
                    setFiles(updatedFiles);
                  }}
                  style={{
                    ...styles.actionBtn,
                    color: file.starred ? '#FFD700' : '#5f6368'
                  }}
                  title={file.starred ? "Unstar" : "Star"}
                >
                  {file.starred ? '★' : '☆'}
                </button>
                <button 
                  onClick={() => handleShareOpen(file)}
                  style={{
                    ...styles.actionBtn,
                    color: file.shared ? '#4285F4' : '#5f6368'
                  }}
                  title={file.shared ? "Shared" : "Share"}
                >
                  🔗
                </button>
                <button 
                  onClick={() => handleDownload(file.id, file.name)}
                  style={styles.actionBtn}
                  title="Download"
                >
                  ⬇️
                </button>
                <button 
                  onClick={() => handleDelete(file.id, file.name)}
                  style={{...styles.actionBtn, color: '#ea4335'}}
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

// Styles
const styles = {
  pageContainer: {
    flex: 1,
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
    border: '1px solid #dadce0',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
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
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  searchSection: {
    marginBottom: '24px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  searchIcon: {
    marginRight: '12px',
    fontSize: '18px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: '#202124',
    outline: 'none',
  },
  filesContainer: {
    gap: '16px',
  },
  fileItem: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: viewMode === 'grid' ? '20px' : '16px',
    transition: 'all 0.2s',
    display: 'flex',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderColor: '#4285F4',
      transform: 'translateY(-2px)',
    },
  },
  fileIconContainer: {
    position: 'relative',
    marginRight: viewMode === 'grid' ? '0' : '16px',
    marginBottom: viewMode === 'grid' ? '16px' : '0',
    display: 'flex',
    justifyContent: 'center',
  },
  fileTypeIcon: {
    fontSize: '48px',
  },
  fileStar: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    fontSize: '16px',
    color: '#FFD700',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '2px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  fileShared: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    fontSize: '14px',
    color: '#4285F4',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '2px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 12px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileMeta: {
    marginBottom: '8px',
  },
  fileTypeBadge: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#4285F4',
    borderRadius: '12px',
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
  },
  fileOwner: {
    fontWeight: '500',
  },
  fileDepartment: {
    color: '#34A853',
  },
  fileClassification: {
    fontWeight: '500',
  },
  fileActions: {
    display: 'flex',
    flexDirection: viewMode === 'grid' ? 'row' : 'column',
    gap: '8px',
    marginLeft: viewMode === 'grid' ? '0' : '16px',
    justifyContent: viewMode === 'grid' ? 'center' : 'flex-start',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#5f6368',
    cursor: 'pointer',
    fontSize: '16px',
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
    padding: '60px 20px',
    backgroundColor: 'white',
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    textAlign: 'center',
    gridColumn: '1 / -1',
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
    margin: '0 0 24px 0',
    maxWidth: '300px',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  footerStats: {
    fontSize: '14px',
    color: '#5f6368',
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

export default MyFiles;