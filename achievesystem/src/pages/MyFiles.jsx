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
        throw new Error("No authentication token found");
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
        setFiles(result.files || []);
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
    file.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
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
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("word") || fileType.includes("document")) return "📘";
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("text")) return "📃";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
    return "📄";
  };

  // Add console logs for debugging
  console.log("MyFiles component rendering...");
  console.log("Loading:", loading);
  console.log("Error:", error);
  console.log("Files count:", files.length);
  console.log("Filtered files count:", filteredFiles.length);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #4285F4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{ fontSize: '16px', color: '#5f6368' }}>Loading your files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        textAlign: 'center',
        margin: '20px',
      }}>
        <div style={{ fontSize: '48px', color: '#dc2626', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', margin: '0 0 8px 0' }}>Error Loading Files</h3>
        <p style={{ fontSize: '14px', color: '#b91c1c', margin: '0 0 20px 0', maxWidth: '400px' }}>{error}</p>
        <button 
          onClick={fetchUserFiles}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
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
        top: '60px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
      }}>
        Files: {files.length} | Filtered: {filteredFiles.length}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Files</h1>
          <p style={styles.subtitle}>
            {files.length} files • {formatFileSize(files.reduce((sum, file) => sum + parseInt(file.file_size || 0), 0))} used
          </p>
        </div>
        <div style={styles.headerControls}>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.viewToggleButton}
          >
            {viewMode === 'grid' ? '📋 List View' : '📊 Grid View'}
          </button>
          <button
            onClick={() => navigate("/upload")}
            style={styles.uploadButton}
          >
            📤 Upload New File
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
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
        display: viewMode === 'grid' ? 'grid' : 'flex',
        flexDirection: viewMode === 'list' ? 'column' : 'row',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none'
      }}>
        {filteredFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📁</div>
            <h3 style={styles.emptyTitle}>No files found</h3>
            <p style={styles.emptyMessage}>
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
              ...styles.fileCard,
              flexDirection: viewMode === 'grid' ? 'column' : 'row',
              alignItems: viewMode === 'grid' ? 'stretch' : 'center'
            }}>
              <div style={styles.fileIcon}>
                <span style={styles.fileTypeIcon}>{getFileIcon(file.filetype)}</span>
                <div style={styles.fileBadge}>
                  {file.is_public ? "Public" : "Private"}
                </div>
              </div>
              
              <div style={styles.fileInfo}>
                <h3 style={styles.fileName} title={file.original_name}>
                  {file.original_name}
                </h3>
                <div style={styles.fileMeta}>
                  <span style={styles.fileSize}>{formatFileSize(file.file_size)}</span>
                  <span style={styles.fileDate}>{formatDate(file.uploaded_at)}</span>
                </div>
                {file.document_type && (
                  <span style={styles.fileType}>{file.document_type}</span>
                )}
                {file.owner && (
                  <p style={styles.fileOwner}>By: {file.owner}</p>
                )}
              </div>
              
              <div style={styles.fileActions}>
                <button 
                  onClick={() => handleDownload(file.id, file.original_name)}
                  style={styles.actionButton}
                  title="Download"
                >
                  ⬇️
                </button>
                <button 
                  onClick={() => handleShareOpen(file)}
                  style={styles.actionButton}
                  title="Share"
                >
                  🔗
                </button>
                <button 
                  onClick={() => handleDelete(file.id, file.original_name)}
                  style={{...styles.actionButton, color: '#ea4335'}}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
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

// Simple inline styles
const styles = {
  pageContainer: {
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#202124',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0',
  },
  headerControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  viewToggleButton: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    color: '#5f6368',
    cursor: 'pointer',
  },
  uploadButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: '20px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '10px 16px',
    border: '1px solid #dadce0',
  },
  searchIcon: {
    marginRight: '10px',
    color: '#5f6368',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    outline: 'none',
    color: '#202124',
  },
  filesContainer: {
    gap: '16px',
  },
  fileCard: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    transition: 'all 0.2s',
  },
  fileIcon: {
    marginRight: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fileTypeIcon: {
    fontSize: '40px',
    marginBottom: '8px',
  },
  fileBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#e8f0fe',
    color: '#4285F4',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileMeta: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
  },
  fileSize: {
    fontSize: '12px',
    color: '#5f6368',
    backgroundColor: '#f1f3f4',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  fileDate: {
    fontSize: '12px',
    color: '#5f6368',
    backgroundColor: '#f1f3f4',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  fileType: {
    fontSize: '12px',
    color: '#4285F4',
    backgroundColor: '#e8f0fe',
    padding: '2px 8px',
    borderRadius: '12px',
    display: 'inline-block',
  },
  fileOwner: {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '8px',
  },
  fileActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  actionButton: {
    width: '36px',
    height: '36px',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#5f6368',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
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
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#dadce0',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  emptyMessage: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0 0 20px 0',
  },
};

export default MyFiles;