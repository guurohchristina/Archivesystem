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
  const [searchTerm, setSearchTerm] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const API_BASE = 'https://archivesystembackend.onrender.com';

  // Fetch folder contents
  useEffect(() => {
    fetchFolderContents();
  }, [folderId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActionsMenu(null);
    };

    if (showActionsMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionsMenu]);

  // Close modals with Escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setShowCreateFolder(false);
        setShowEditModal(false);
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
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

      // 2. Fetch files in this folder
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
        
        // Transform files for display
        const transformedFiles = filteredFiles.map(file => {
          // Determine file type from filename
          let fileType = "document";
          const fileName = file.original_name?.toLowerCase() || "";
          
          if (fileName.includes('.pdf')) fileType = "pdf";
          else if (fileName.includes('.doc') || fileName.includes('.docx')) fileType = "doc";
          else if (fileName.includes('.xls') || fileName.includes('.xlsx') || fileName.includes('.csv')) fileType = "spreadsheet";
          else if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || fileName.includes('.gif') || fileName.includes('.bmp')) fileType = "image";
          else if (fileName.includes('.mp4') || fileName.includes('.mov') || fileName.includes('.avi') || fileName.includes('.mkv')) fileType = "video";
          else if (fileName.includes('.mp3') || fileName.includes('.wav') || fileName.includes('.aac')) fileType = "audio";
          else if (fileName.includes('.zip') || fileName.includes('.rar') || fileName.includes('.7z')) fileType = "archive";
          
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
            starred: false,
            owner: file.owner || "Unknown",
            department: file.department || "General",
            fileSizeBytes: file.file_size || 0,
            uploadedAt: file.uploaded_at,
            folderId: file.folder_id,
            _apiData: file
          };
        });
        
        setFiles(transformedFiles);
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

  const handleEditFolder = async () => {
    if (!editFolderName.trim() || !editingFolder) {
      alert("Please enter a folder name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      console.log("Updating folder:", editingFolder.id, "New name:", editFolderName.trim());
      
      const response = await fetch(`${API_BASE}/api/folders/${editingFolder.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFolderName.trim()
        })
      });

      const result = await response.json();
      console.log("Update folder response:", result);
      
      if (result.success) {
        alert("Folder renamed successfully!");
        setShowEditModal(false);
        setEditingFolder(null);
        setEditFolderName("");
        fetchFolderContents(); // Refresh
      } else {
        alert(result.message || "Failed to rename folder");
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      alert("Error renaming folder. Please try again.");
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Are you sure you want to delete folder "${folder.name}"? This will also delete all contents inside.`)) {
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
        alert("Folder deleted successfully");
        setShowActionsMenu(null); // Close the menu
        fetchFolderContents(); // Refresh
      } else {
        alert(result.message || "Failed to delete folder");
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("Error deleting folder. Please try again.");
    }
  };

  const handleUpload = () => {
    if (folderId) {
      navigate(`/upload?folder=${folderId}`);
    } else {
      navigate('/upload');
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
        a.download = file.name;
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

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete file "${file.name}"?`)) {
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
    }
  };

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setShowEditModal(true);
    setShowActionsMenu(null); // Close the actions menu
  };

  const openActionsMenu = (e, itemId, type) => {
    e.stopPropagation(); // Prevent folder click
    setShowActionsMenu(showActionsMenu === itemId ? null : itemId);
  };

  // Filter files and folders based on search
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading folder contents...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: 'red'
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#5f6368' }}>
        <Link to="/files" style={{ color: '#4285f4', textDecoration: 'none' }}>
          My Files
        </Link>
        {currentFolder && (
          <>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#202124', fontWeight: '500' }}>
              {currentFolder.name}
            </span>
          </>
        )}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>{currentFolder ? `📁 ${currentFolder.name}` : '📂 My Files'}</h1>
        <div>
          <button onClick={handleUpload} style={styles.button}>
            📤 Upload File
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

      {/* Search Bar */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'white',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '0 12px',
          maxWidth: '500px'
        }}>
          <span style={{ fontSize: '16px', color: '#5f6368', marginRight: '8px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: 'transparent'
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              style={{
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
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateFolder(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Create New Folder</h3>
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
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
                style={styles.modalCancel}
                disabled={isCreatingFolder}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                style={styles.modalConfirm}
                disabled={!newFolderName.trim() || isCreatingFolder}
              >
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {showEditModal && editingFolder && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Rename Folder</h3>
            <p style={styles.modalDescription}>
              Enter new name for folder
            </p>
            <input
              type="text"
              placeholder="Enter new folder name"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFolder(null);
                  setEditFolderName("");
                }}
                style={styles.modalCancel}
              >
                Cancel
              </button>
              <button
                onClick={handleEditFolder}
                style={styles.modalConfirm}
                disabled={!editFolderName.trim()}
              >
                Rename Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders Section */}
      {filteredFolders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3>Folders ({filteredFolders.length})</h3>
          <div style={styles.foldersGrid}>
            {filteredFolders.map(folder => (
              <div 
                key={folder.id} 
                style={styles.folderCard}
                onClick={() => navigate(`/files/folder/${folder.id}`)}
              >
                <div style={styles.folderContent}>
                  <div style={styles.folderIcon}>📁</div>
                  <div style={styles.folderName}>{folder.name}</div>
                  <div style={styles.folderDate}>
                    Created: {new Date(folder.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Three Dots Menu Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionsMenu(e, folder.id, 'folder');
                  }}
                  style={styles.dotsButton}
                  title="Folder actions"
                >
                  ⋮
                </button>
                
                {/* Actions Menu Dropdown */}
                {showActionsMenu === folder.id && (
                  <div style={styles.actionsMenu} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(folder);
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
            ))}
          </div>
        </div>
      )}

      {/* Files Section - LIST VIEW */}
     { files.length > 0 && (
  <div style={{ marginBottom: '40px' }}>
    <h3>Files ({files.length})</h3>
    <div style={styles.filesList}>
      {files.map(file => (
        <div
          key={file.id}
          style={styles.fileListItem}
        >
          {/* File Icon */}
          <div style={styles.fileListIcon}>
            {getFileIcon(file.name)}
          </div>
          
          {/* File Info */}
          <div style={styles.fileListInfo}>
            <div style={styles.fileListName}>{file.name}</div>
            <div style={styles.fileListDetails}>
              <span style={styles.fileListType}>{file.type.toUpperCase()}</span>
              <span style={styles.fileListSize}>{file.size}</span>
              <span style={styles.fileListDate}>{file.date}</span>
            </div>
            {file.owner && file.owner !== "Unknown" && (
              <div style={styles.fileListOwner}>👤 {file.owner}</div>
            )}
          </div>
          
          {/* File Actions - INLINE, NO THREE DOTS */}
          <div style={styles.fileListActions}>
            {/* Star/Unstar Button */}
            <button
              onClick={() => {
                const updatedFiles = files.map(f => 
                  f.id === file.id ? { ...f, starred: !f.starred } : f
                );
                setFiles(updatedFiles);
              }}
              style={{
                ...styles.actionButton,
                color: file.starred ? '#ffc107' : '#6c757d',
                marginRight: '8px'
              }}
              title={file.starred ? "Unstar" : "Star"}
            >
              {file.starred ? '★' : '☆'}
            </button>
            
            {/* Download Button */}
            <button
              onClick={() => handleDownload(file)}
              style={{
                ...styles.actionButton,
                marginRight: '8px'
              }}
              title="Download"
            >
              ⬇️
            </button>
            
            {/* Rename Button */}
            <button
              onClick={() => handleRenameFile(file)}
              style={{
                ...styles.actionButton,
                marginRight: '8px'
              }}
              title="Rename"
            >
              ✏️
            </button>
            
            {/* Delete Button */}
            <button
              onClick={() => handleDeleteFile(file)}
              style={{
                ...styles.actionButton,
                color: '#ea4335'
              }}
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
      {filteredFolders.length === 0 && filteredFiles.length === 0 && (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📁</div>
          <h3>This folder is empty</h3>
          <p>Upload files or create subfolders to get started</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button onClick={handleUpload} style={styles.button}>
              📤 Upload First File
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

      {/* Add CSS for hover effects */}
      <style>
        {`
          /* Button hover effects */
          button:hover {
            opacity: 0.9;
          }
          
          /* Primary button hover */
          [style*="background-color: #4285f4"]:hover {
            background-color: #3367d6 !important;
          }
          
          /* Secondary button hover */
          [style*="background-color: #f1f3f4"]:hover {
            background-color: #e8eaed !important;
          }
          
          /* Folder card hover */
          [style*="border: 1px solid #e0e0e0"][style*="padding: 20px"]:hover {
            background-color: #f1f3f4 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.2s;
          }
          
          /* File card hover */
          [style*="border: 1px solid #e0e0e0"][style*="padding: 15px"]:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: box-shadow 0.2s;
          }
          
          /* Dots button hover */
          [style*="color: #5f6368"][style*="font-size: 20px"]:hover {
            background-color: rgba(0, 0, 0, 0.05) !important;
          }
          
          /* Action button hover */
          [style*="background: none"][style*="font-size: 16px"]:hover {
            background-color: rgba(0, 0, 0, 0.05) !important;
          }
          
          /* Modal input focus */
          input:focus {
            outline: none;
            border-color: #4285f4 !important;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
          }
          
          /* Search input focus */
          [style*="border: 1px solid #dadce0"]:focus-within {
            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
            border-color: #4285f4 !important;
          }
          
          /* Animations */
          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: translateY(-5px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          .actions-menu {
            animation: fadeIn 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
};

// Helper functions
const getFileIcon = (filename) => {
  if (!filename) return '📎';
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return '🖼️';
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return '🎬';
  if (['mp3', 'wav', 'aac'].includes(ext)) return '🎵';
  if (['zip', 'rar', '7z'].includes(ext)) return '📦';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  return '📎';
};

// Styles (same as MyFiles page)
const styles = {
  button: {
    padding: '10px 20px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
    transition: 'background-color 0.2s',
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '500',
    color: '#202124',
  },
  modalDescription: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0 0 16px 0',
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  modalCancel: {
    padding: '8px 16px',
    backgroundColor: '#f1f3f4',
    color: '#202124',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modalConfirm: {
    padding: '8px 16px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  foldersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '15px',
    position: 'relative',
  },
  folderCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    position: 'relative',
  },
  folderContent: {
    textAlign: 'center',
  },
  folderIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  folderName: {
    fontSize: '14px',
    color: '#202124',
    fontWeight: '500',
    marginBottom: '5px',
    wordBreak: 'break-word',
  },
  folderDate: {
    fontSize: '12px',
    color: '#5f6368',
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
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    minWidth: '120px',
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
  filesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px',
    marginTop: '15px',
  },
  fileCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
  },
  fileIcon: {
    fontSize: '36px',
    flexShrink: 0,
  },
  fileName: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileActions: {
    display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368',
  },
};

export default Folder;