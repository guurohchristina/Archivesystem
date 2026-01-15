import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, useParams, Link } from "react-router-dom";

const Folder = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const API_BASE = 'https://archivesystembackend.onrender.com';

  // Fetch folder contents
  useEffect(() => {
    fetchFolderContents();
  }, [folderId]);

  const fetchFolderContents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in");

      console.log(`📂 Fetching folder ${folderId || 'root'}...`);

      // 1. Fetch current folder info
      if (folderId) {
        const folderRes = await fetch(`${API_BASE}/api/folders/${folderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const folderData = await folderRes.json();
        if (folderData.success) {
          setCurrentFolder(folderData.folder);
        }
      }

      // 2. Fetch files in this folder
      const filesRes = await fetch(
        `${API_BASE}/api/upload?folder_id=${folderId || 'root'}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const filesData = await filesRes.json();
      
      console.log("Files response:", filesData);
      
      if (filesData.success) {
        setFiles(filesData.files || []);
      } else {
        setFiles([]);
      }

      // 3. Fetch subfolders
      const foldersRes = await fetch(
        `${API_BASE}/api/folders?parent_id=${folderId || 'root'}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const foldersData = await foldersRes.json();
      
      console.log("Folders response:", foldersData);
      
      if (foldersData.success) {
        setFolders(foldersData.folders || []);
      } else {
        setFolders([]);
      }

    } catch (err) {
      console.error("Error fetching folder:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter folder name");
      return;
    }

    setIsCreatingFolder(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/folders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parent_id: folderId || "root"
        })
      });

      const result = await response.json();
      if (result.success) {
        setNewFolderName("");
        setShowCreateFolder(false);
        fetchFolderContents(); // Refresh
        alert("Folder created successfully!");
      } else {
        alert(result.message || "Failed to create folder");
      }
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Failed to create folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Delete folder "${folder.name}" and all its contents?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/folders/${folder.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        fetchFolderContents(); // Refresh
        alert("Folder deleted successfully!");
      } else {
        alert(result.message || "Failed to delete folder");
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("Failed to delete folder");
    }
  };

  const handleUpload = () => {
    if (folderId) {
      navigate(`/upload?folder=${folderId}`);
    } else {
      navigate('/upload');
    }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete file "${file.original_name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${file.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        fetchFolderContents(); // Refresh
        alert("File deleted successfully!");
      } else {
        alert(result.message || "Failed to delete file");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file");
    }
  };

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.original_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download file");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading file");
    }
  };

  // Close modal when clicking outside
  const handleModalClose = (e) => {
    if (e.target.id === "modal-overlay") {
      setShowCreateFolder(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading folder...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchFolderContents} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          {currentFolder ? `📁 ${currentFolder.name}` : '📂 My Files'}
        </h1>
        
        <div style={styles.actions}>
          <button 
            onClick={handleUpload} 
            style={styles.primaryButton}
            disabled={isCreatingFolder}
          >
            📤 Upload Files
          </button>
          <button 
            onClick={() => setShowCreateFolder(true)}
            style={styles.secondaryButton}
            disabled={isCreatingFolder}
          >
            📁 New Folder
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/files" style={styles.breadcrumbLink}>
          My Files
        </Link>
        {currentFolder && (
          <>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbCurrent}>
              {currentFolder.name}
            </span>
          </>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div 
          id="modal-overlay"
          style={styles.modalOverlay}
          onClick={handleModalClose}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Create New Folder</h3>
            <p style={styles.modalDescription}>
              {folderId 
                ? `Create a subfolder inside "${currentFolder?.name || 'this folder'}"`
                : 'Create a new folder in My Files'}
            </p>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={styles.modalInput}
              autoFocus
              disabled={isCreatingFolder}
            />
            <div style={styles.modalActions}>
              <button 
                onClick={() => setShowCreateFolder(false)}
                style={styles.cancelButton}
                disabled={isCreatingFolder}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder}
                style={styles.confirmButton}
                disabled={isCreatingFolder || !newFolderName.trim()}
              >
                {isCreatingFolder ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders List */}
      {folders.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Folders ({folders.length})</h3>
          <div style={styles.foldersGrid}>
            {folders.map((folder) => (
              <div key={folder.id} style={styles.folderItem}>
                <Link 
                  to={`/files/folder/${folder.id}`} 
                  style={styles.folderLink}
                >
                  <div style={styles.folderIcon}>📁</div>
                  <div style={styles.folderName}>{folder.name}</div>
                  <div style={styles.folderInfo}>
                    Created: {new Date(folder.created_at).toLocaleDateString()}
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder);
                  }}
                  style={styles.deleteButton}
                  title="Delete Folder"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Files ({files.length})</h3>
          <div style={styles.filesTable}>
            <div style={styles.tableHeader}>
              <div style={styles.colName}>Name</div>
              <div style={styles.colType}>Type</div>
              <div style={styles.colSize}>Size</div>
              <div style={styles.colDate}>Uploaded</div>
              <div style={styles.colActions}>Actions</div>
            </div>
            
            {files.map((file) => (
              <div key={file.id} style={styles.tableRow}>
                <div style={styles.colName}>
                  <span style={styles.fileIcon}>
                    {getFileIcon(file.filetype || file.original_name)}
                  </span>
                  <span style={styles.fileNameText}>
                    {file.original_name}
                  </span>
                </div>
                <div style={styles.colType}>
                  {getFileType(file.filetype || file.original_name)}
                </div>
                <div style={styles.colSize}>
                  {formatFileSize(file.file_size)}
                </div>
                <div style={styles.colDate}>
                  {new Date(file.uploaded_at).toLocaleDateString()}
                </div>
                <div style={styles.colActions}>
                  <button
                    onClick={() => handleDownload(file)}
                    style={styles.actionButton}
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    style={styles.deleteButton}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && folders.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <h3>This folder is empty</h3>
          <p>Upload files or create subfolders to get started</p>
          <div style={styles.emptyActions}>
            <button 
              onClick={handleUpload} 
              style={styles.primaryButton}
            >
              📤 Upload Files
            </button>
            <button 
              onClick={() => setShowCreateFolder(true)}
              style={styles.secondaryButton}
            >
              📁 Create Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getFileIcon = (filename) => {
  if (!filename) return '📎';
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
  if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬';
  if (['zip', 'rar'].includes(ext)) return '📦';
  return '📎';
};

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  return ext.toUpperCase() || 'FILE';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};

// Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#3367d6',
    },
    ':disabled': {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#f1f3f4',
    color: '#202124',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e8eaed',
    },
    ':disabled': {
      backgroundColor: '#f5f5f5',
      color: '#bdbdbd',
      cursor: 'not-allowed',
    },
  },
  breadcrumb: {
    marginBottom: '30px',
    fontSize: '14px',
    color: '#5f6368',
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumbLink: {
    color: '#4285f4',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  breadcrumbSeparator: {
    margin: '0 8px',
  },
  breadcrumbCurrent: {
    color: '#202124',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  modalDescription: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '10px 0 15px 0',
  },
  modalInput: {
    width: '100%',
    padding: '12px',
    margin: '15px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
    ':focus': {
      outline: 'none',
      borderColor: '#4285f4',
      boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
    },
    ':disabled': {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
    },
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f1f3f4',
    color: '#202124',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#e8eaed',
    },
    ':disabled': {
      backgroundColor: '#f5f5f5',
      color: '#bdbdbd',
      cursor: 'not-allowed',
    },
  },
  confirmButton: {
    padding: '10px 20px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#3367d6',
    },
    ':disabled': {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '15px',
    color: '#202124',
  },
  foldersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
  folderItem: {
    position: 'relative',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f1f3f4',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
  },
  folderLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  folderIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  folderName: {
    fontSize: '15px',
    color: '#202124',
    fontWeight: '500',
    wordBreak: 'break-word',
    textAlign: 'center',
    marginBottom: '8px',
  },
  folderInfo: {
    fontSize: '12px',
    color: '#5f6368',
    textAlign: 'center',
  },
  filesTable: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderBottom: '1px solid #e0e0e0',
    fontWeight: '500',
    color: '#5f6368',
    fontSize: '14px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr',
    padding: '15px',
    borderBottom: '1px solid #e0e0e0',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
    ':last-child': {
      borderBottom: 'none',
    },
  },
  colName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
  },
  fileIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  fileNameText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '14px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f1f3f4',
    },
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px',
    borderRadius: '4px',
    color: '#ea4335',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#fce8e6',
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#5f6368',
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    opacity: 0.5,
  },
  emptyActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px',
    flexWrap: 'wrap',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4285f4',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    color: '#ea4335',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '15px',
    ':hover': {
      backgroundColor: '#3367d6',
    },
  },
};

// Add CSS animation
const addStyles = () => {
  if (!document.getElementById('folder-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'folder-styles';
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

// Call the style function
addStyles();

export default Folder;