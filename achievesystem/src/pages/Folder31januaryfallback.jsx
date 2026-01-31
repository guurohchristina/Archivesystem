import { useState, useEffect, useContext, useRef } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [folderActionsMenu, setFolderActionsMenu] = useState(null);
  const [fileActionsMenu, setFileActionsMenu] = useState(null);
  const [moveFileModal, setMoveFileModal] = useState(null);
  const [allFolders, setAllFolders] = useState([]);
  const [selectedMoveFolder, setSelectedMoveFolder] = useState("");

  const API_BASE = 'https://archivesystembackend.onrender.com';
  const actionsMenuRef = useRef(null);

  // Fetch folder contents
  useEffect(() => {
    fetchFolderContents();
    fetchAllFolders(); // Fetch all folders for move file dropdown
  }, [folderId]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setFolderActionsMenu(null);
        setFileActionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // 2. Fetch files in this folder - Use the ALL files endpoint and filter
      const filesRes = await fetch(`${API_BASE}/api/upload`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const filesData = await filesRes.json();
      console.log("📦 All files response:", {
        success: filesData.success,
        count: filesData.files?.length || 0
      });
      
      if (filesData.success) {
        const allFiles = filesData.files || [];
        
        // Filter files for this specific folder
        let filteredFiles;
        if (folderId) {
          // For specific folder - get files where folder_id matches
          filteredFiles = allFiles.filter(file => {
            const fileFolderId = file.folder_id || file.folderId;
            return fileFolderId && fileFolderId.toString() === folderId.toString();
          });
          console.log(`📄 Found ${filteredFiles.length} files in folder ${folderId}`);
        } else {
          // For root - get files with no folder_id or null folder_id
          filteredFiles = allFiles.filter(file => {
            const fileFolderId = file.folder_id || file.folderId;
            return !fileFolderId || fileFolderId === null || fileFolderId === 'null';
          });
          console.log(`📄 Found ${filteredFiles.length} files in root`);
        }
        
        setFiles(filteredFiles);
      } else {
        console.error("Files API error:", filesData.message);
        setFiles([]);
      }

      // 3. Fetch subfolders
      const foldersRes = await fetch(
        `${API_BASE}/api/folders?parent_id=${folderId || 'root'}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const foldersData = await foldersRes.json();
      console.log("📁 Folders response:", {
        success: foldersData.success,
        count: foldersData.folders?.length || 0
      });
      
      if (foldersData.success) {
        setFolders(foldersData.folders || []);
      } else {
        console.error("Folders API error:", foldersData.message);
        setFolders([]);
      }

    } catch (err) {
      console.error("Error fetching folder:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFolders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/folders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = await response.json();
      if (result.success) {
        // Filter out current folder from move options
        const filteredFolders = result.folders.filter(f => f.id !== folderId);
        setAllFolders(filteredFolders);
      }
    } catch (err) {
      console.error("Error fetching all folders:", err);
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
        alert(result.message);
      }
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Failed to create folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleEditFolder = async (folder) => {
    const newName = prompt("Enter new folder name:", folder.name);
    if (!newName || newName.trim() === folder.name) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/folders/${folder.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName.trim() })
      });

      const result = await response.json();
      if (result.success) {
        fetchFolderContents(); // Refresh
        alert("Folder renamed successfully!");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Error editing folder:", err);
      alert("Failed to rename folder");
    } finally {
      setFolderActionsMenu(null);
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
        alert(result.message);
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("Failed to delete folder");
    } finally {
      setFolderActionsMenu(null);
    }
  };

  const handleUpload = () => {
    if (folderId) {
      navigate(`/upload?folder=${folderId}`);
    } else {
      navigate('/upload');
    }
  };

  const handleEditFile = (file) => {
    // Navigate to upload page with file data for editing
    navigate(`/upload?edit=${file.id}&folder=${folderId || 'root'}`);
  };

  const handleMoveFile = async (file) => {
    if (!selectedMoveFolder) {
      alert("Please select a destination folder");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${file.id}/move`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder_id: selectedMoveFolder })
      });

      const result = await response.json();
      if (result.success) {
        setMoveFileModal(null);
        setSelectedMoveFolder("");
        fetchFolderContents(); // Refresh
        alert("File moved successfully!");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Error moving file:", err);
      alert("Failed to move file");
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
        alert(result.message);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file");
    } finally {
      setFileActionsMenu(null);
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

  // Filter files and folders based on search
  const filteredFiles = files.filter(file => 
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div style={styles.container}>
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

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchInputContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              style={styles.clearSearchButton}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            {currentFolder ? `📁 ${currentFolder.name}` : '📂 My Files'}
          </h1>
          <div style={styles.filesStats}>
            {filteredFiles.length + filteredFolders.length} items
            {filteredFiles.length > 0 && ` • ${filteredFiles.length} files`}
            {filteredFolders.length > 0 && ` • ${filteredFolders.length} folders`}
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <button onClick={handleUpload} style={styles.primaryButton}>
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

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateFolder(false)}>
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

      {/* Move File Modal */}
      {moveFileModal && (
        <div style={styles.modalOverlay} onClick={() => setMoveFileModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Move File</h3>
            <p style={styles.modalDescription}>
              Move "{moveFileModal.original_name}" to another folder
            </p>
            <select
              value={selectedMoveFolder}
              onChange={(e) => setSelectedMoveFolder(e.target.value)}
              style={styles.moveSelect}
            >
              <option value="">Select a folder...</option>
              <option value="root">📂 My Files (Root)</option>
              {allFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            <div style={styles.modalActions}>
              <button 
                onClick={() => setMoveFileModal(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleMoveFile(moveFileModal)}
                style={styles.confirmButton}
                disabled={!selectedMoveFolder}
              >
                Move File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders List */}
      {filteredFolders.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Folders ({filteredFolders.length})</h3>
          <div style={styles.foldersGrid}>
            {filteredFolders.map((folder) => (
              <div key={folder.id} style={styles.folderItem}>
                <Link 
                  to={`/files/folder/${folder.id}`} 
                  style={styles.folderLink}
                >
                  <div style={styles.folderIcon}>📁</div>
                  <div style={styles.folderName}>{folder.name}</div>
                </Link>
                
                {/* Three Dots Menu for Folder */}
                <div style={styles.actionsContainer}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderActionsMenu(folderActionsMenu === folder.id ? null : folder.id);
                      setFileActionsMenu(null);
                    }}
                    style={styles.dotsButton}
                    title="Folder actions"
                  >
                    ⋮
                  </button>
                  
                  {folderActionsMenu === folder.id && (
                    <div ref={actionsMenuRef} style={styles.actionsMenu}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFolder(folder);
                        }}
                        style={styles.menuItem}
                      >
                        <span style={{ marginRight: '8px' }}>✏️</span>
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder);
                        }}
                        style={{ ...styles.menuItem, color: '#ea4335' }}
                      >
                        <span style={{ marginRight: '8px' }}>🗑️</span>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List */}
      {filteredFiles.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Files ({filteredFiles.length})</h3>
          <div style={styles.filesTable}>
            <div style={styles.tableHeader}>
              <div style={styles.colName}>Name</div>
              <div style={styles.colType}>Type</div>
              <div style={styles.colSize}>Size</div>
              <div style={styles.colDate}>Uploaded</div>
              <div style={styles.colActions}>Actions</div>
            </div>
            
            {filteredFiles.map((file) => (
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
                  
                  {/* Three Dots Menu for File */}
                  <div style={styles.fileActionsContainer}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileActionsMenu(fileActionsMenu === file.id ? null : file.id);
                        setFolderActionsMenu(null);
                      }}
                      style={styles.dotsButton}
                      title="File actions"
                    >
                      ⋮
                    </button>
                    
                    {fileActionsMenu === file.id && (
                      <div ref={actionsMenuRef} style={styles.actionsMenu}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFile(file);
                          }}
                          style={styles.menuItem}
                        >
                          <span style={{ marginRight: '8px' }}>✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMoveFileModal(file);
                            setFileActionsMenu(null);
                          }}
                          style={styles.menuItem}
                        >
                          <span style={{ marginRight: '8px' }}>📂</span>
                          Move
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file);
                          }}
                          style={{ ...styles.menuItem, color: '#ea4335' }}
                        >
                          <span style={{ marginRight: '8px' }}>🗑️</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - Always show buttons even when empty */}
      {filteredFiles.length === 0 && filteredFolders.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <h3>This folder is empty</h3>
          <p>Upload files or create subfolders to get started</p>
          <div style={styles.emptyActions}>
            <button onClick={handleUpload} style={styles.primaryButton}>
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    margin: 0,
    marginBottom: '5px',
  },
  filesStats: {
    fontSize: '14px',
    color: '#5f6368',
  },
  breadcrumb: {
    marginTop: '30px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#5f6368',
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumbLink: {
    color: '#4285f4',
    textDecoration: 'none',
  },
  breadcrumbSeparator: {
    margin: '0 8px',
  },
  breadcrumbCurrent: {
    color: '#202124',
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: '30px',
  },
  searchInputContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '0 12px',
    maxWidth: '500px',
  },
  searchIcon: {
    fontSize: '16px',
    color: '#5f6368',
    marginRight: '8px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent',
  },
  clearSearchButton: {
    background: 'none',
    border: 'none',
    color: '#5f6368',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  moveSelect: {
    width: '100%',
    padding: '12px',
    margin: '15px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
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
  },
  actionsContainer: {
    position: 'absolute',
    top: '10px',
    right: '10px',
  },
  fileActionsContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  dotsButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  actionsMenu: {
    position: 'absolute',
    right: '0',
    top: '100%',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    minWidth: '140px',
    zIndex: 100,
    overflow: 'hidden',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#202124',
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
  colActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px',
    borderRadius: '4px',
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
  },
};

// Add CSS for hover effects
const addStyles = () => {
  if (!document.getElementById('folder-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'folder-styles';
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Button hover effects */
      button:hover {
        opacity: 0.9;
      }
      
      /* Primary button specific */
      [style*="background-color: #4285f4"]:hover {
        background-color: #3367d6 !important;
      }
      
      /* Secondary button specific */
      [style*="background-color: #f1f3f4"]:hover {
        background-color: #e8eaed !important;
      }
      
      /* Folder item hover */
      [style*="border: 1px solid #e0e0e0"][style*="padding: 20px"]:hover {
        background-color: #f1f3f4 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.2s;
      }
      
      /* Dots button hover */
      [style*="color: #5f6368"][style*="font-size: 20px"]:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
      }
      
      /* Menu item hover */
      [style*="display: flex"][style*="align-items: center"][style*="width: 100%"]:hover {
        background-color: #f5f5f5 !important;
      }
      
      /* Search input focus */
      input[type="text"]:focus {
        outline: none;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
        border-color: #4285f4 !important;
      }
      
      /* Modal input focus */
      [style*="width: 100%"][style*="padding: 12px"]:focus {
        outline: none;
        border-color: #4285f4 !important;
        box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
      }
      
      /* Action button hover */
      [style*="background: none"][style*="font-size: 16px"]:hover {
        background-color: #f1f3f4 !important;
      }
      
      /* Table row hover */
      [style*="display: grid"][style*="grid-template-columns: 3fr 1fr 1fr 1fr 1fr"]:hover {
        background-color: #f8f9fa !important;
      }
      
      /* Breadcrumb link hover */
      a[style*="color: #4285f4"]:hover {
        text-decoration: underline;
      }
      
      /* Cancel button hover */
      [style*="background-color: #f1f3f4"][style*="color: #202124"]:hover {
        background-color: #e8eaed !important;
      }
      
      /* Confirm button hover */
      [style*="background-color: #4285f4"][style*="color: white"]:hover {
        background-color: #3367d6 !important;
      }
      
      .actions-menu {
        animation: fadeIn 0.2s ease-out;
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

addStyles();

export default Folder;