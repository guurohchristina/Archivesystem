import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import BlueFolderIcon from "./BlueFolderIcon.jsx";
const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]); // KEEP THIS ONE
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [error, setError] = useState(null); // Added error state

  const API_BASE = 'https://archivesystembackend.onrender.com';

  useEffect(() => {
    fetchRootContents();
  }, []);

  // Initialize styles and hover effects
  useEffect(() => {
    addStyles();
    addHoverListeners();
  }, []);

  const fetchRootContents = async () => {
    try {
      const token = localStorage.getItem("token");
      
      console.log("🔍 Fetching root contents...");
      
      // Get root folders
      const foldersRes = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const foldersData = await foldersRes.json();
      
      if (foldersData.success) {
        setFolders(foldersData.folders || []);
        console.log(`📁 Got ${foldersData.folders?.length || 0} folders`);
      } else {
        console.error("❌ Folders API error:", foldersData.message);
        setFolders([]);
      }
      
      // Fetch files
      await fetchFiles();
      
    } catch (err) {
      console.error("❌ Error in fetchRootContents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files function
  const fetchFiles = async () => {
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
      console.log("Files API Response:", result);

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
            starred: false,
            shared: file.is_public || false,
            owner: file.owner || "Unknown",
            department: file.department || "General",
            classification: file.classification_level || "Unclassified",
            description: file.description || "",
            fileSizeBytes: file.file_size || 0,
            uploadedAt: file.uploaded_at,
            documentType: file.document_type,
            isPublic: file.is_public,
            folderId: file.folder_id,
            _apiData: file
          };
        });
        
        console.log("Transformed files:", transformedFiles.length);
        
        // Filter files for root (no folder_id or null folder_id)
        const filteredFiles = transformedFiles.filter(file => 
          !file.folderId || 
          file.folderId === null || 
          file.folderId === '' || 
          file.folderId === 'null'
        );
        
        console.log(`📂 Showing ${filteredFiles.length} root files`);
        setFiles(filteredFiles);
        setFilteredFiles(filteredFiles); // Also set filteredFiles
        
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

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      console.log("Creating folder with name:", newFolderName.trim());
      
      const response = await fetch(`${API_BASE}/api/folders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parent_id: "root"
        })
      });

      const result = await response.json();
      console.log("Create folder response:", result);
      
      if (result.success) {
        alert("Folder created successfully!");
        setShowCreateFolderModal(false);
        setNewFolderName("");
        fetchRootContents();
      } else {
        alert(result.message || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder. Please try again.");
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
        fetchRootContents();
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
        setShowActionsMenu(null);
        fetchRootContents();
      } else {
        alert(result.message || "Failed to delete folder");
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("Error deleting folder. Please try again.");
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
  
  const handleRenameFile = (file) => {
  const newName = prompt("Enter new file name (with extension):", file.name);
  if (newName && newName.trim() !== file.name) {
    const updatedFiles = files.map(f => 
      f.id === file.id ? { ...f, name: newName.trim() } : f
    );
    setFiles(updatedFiles);
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
 
 
 
  
  
  
  
{/* const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
 */}
  
  
  
  
  

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setShowEditModal(true);
    setShowActionsMenu(null);
  };

  const openActionsMenu = (e, folderId) => {
    e.stopPropagation();
    setShowActionsMenu(showActionsMenu === folderId ? null : folderId);
  };

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
        setShowCreateFolderModal(false);
        setShowEditModal(false);
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading files and folders...</div>
      </div>
    );
  }

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>📂 My Files</h1>
        <div>
          <button onClick={handleUpload} style={styles.button}>
            📤 Upload File
          </button>
          <button 
            onClick={() => setShowCreateFolderModal(true)} 
            style={styles.secondaryButton}
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
      {showCreateFolderModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateFolderModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Create New Folder</h3>
            <p style={styles.modalDescription}>
              This folder will be created in My Files (root)
            </p>
            <input
              type="text"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName("");
                }}
                style={styles.modalCancel}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                style={styles.modalConfirm}
                disabled={!newFolderName.trim()}
              >
                Create Folder
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
    {/*  {folders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3>Folders ({folders.length})</h3>
          <div style={styles.foldersGrid}>
            {folders.map(folder => (
              <div 
                key={folder.id} 
                style={styles.folderCard}
                onClick={() => navigate(`/files/folder/${folder.id}`)}
              >
                <div style={styles.folderContent}>
                <BlueFolderIcon size={48} />
                  <div style={styles.folderName}>{folder.name}</div>
                  <div style={styles.folderDate}>
                    Created: {new Date(folder.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Three Dots Menu Button 
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionsMenu(e, folder.id);
                  }}
                  style={styles.dotsButton}
                  title="Folder actions"
                >
                  ⋮
                </button>
                
                {/* Actions Menu Dropdown 
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
                      Edit
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
      )}*/}
      {folders.length > 0 && (
  <div style={{ marginBottom: '40px' }}>
    <h3>Folders ({folders.length})</h3>
    <div style={styles.foldersGrid}>
      {folders.map(folder => (
        <div 
          key={folder.id} 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => navigate(`/files/folder/${folder.id}`)}
        >
          {/* Folder Icon Container with Dots Button */}
          <div style={{ 
            position: 'relative',
            marginBottom: '12px'
          }}>
            {/* Blue Folder Icon */}
            <div style={{ 
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BlueFolderIcon size={64} />
            </div>
            
            {/* Three Dots Menu Button - On top of folder icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openActionsMenu(e, folder.id);
              }}
              style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#5f6368',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
              title="Folder actions"
            >
              ⋮
            </button>
            
            {/* Actions Menu Dropdown */}
            {showActionsMenu === folder.id && (
              <div style={{
                position: 'absolute',
                top: '30px',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                minWidth: '120px',
                zIndex: 100,
                overflow: 'hidden'
              }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(folder);
                  }}
                  style={{
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
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ marginRight: '8px' }}>✏️</span>
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 12px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#ea4335',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ marginRight: '8px' }}>🗑️</span>
                  Delete
                </button>
              </div>
            )}
          </div>
          
          {/* Folder Name and Date - Below the icon */}
          <div style={{ textAlign: 'center', maxWidth: '150px' }}>
            <div style={{
              fontSize: '14px',
              color: '#202124',
              fontWeight: '500',
              marginBottom: '4px',
              wordBreak: 'break-word',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {folder.name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#5f6368',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {new Date(folder.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      
      
      



      {/* Files Section */}
      {/*{files.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3>Files ({files.length})</h3>
          <div style={styles.filesGrid}>
            {files.map(file => (
              <div
                key={file.id}
                style={styles.fileCard}
              >
                <div style={styles.fileIcon}>{getFileIcon(file.name)}</div>
                <div style={styles.fileName}>{file.name}</div>
                <div style={styles.fileSize}>{file.size}</div>
                <div style={styles.fileDate}>
                  {file.date}
                </div>
                <div style={styles.fileActions}>
                  <button
                    onClick={() => handleDownload(file)}
                    style={styles.actionButton}
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => {
                      const updatedFiles = files.map(f => 
                        f.id === file.id ? { ...f, starred: !f.starred } : f
                      );
                      setFiles(updatedFiles);
                    }}
                    style={styles.actionButton}
                    title={file.starred ? "Unstar" : "Star"}
                  >
                    {file.starred ? '★' : '☆'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}*/}
      
      {files.length > 0 && (
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
      {folders.length === 0 && files.length === 0 && (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📂</div>
          <h3>No files or folders yet</h3>
          <p>Get started by uploading files or creating folders</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button onClick={handleUpload} style={styles.button}>
              📤 Upload First File
            </button>
            <button 
              onClick={() => setShowCreateFolderModal(true)} 
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

// Helper functions (keep these outside the component)
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

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Styles
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
    position: 'absolute',
    top: '10px',
    right: '10px',
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
    top: '40px',
    right: '10px',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '15px',
  },
  fileCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white',
  },
  fileIcon: {
    fontSize: '30px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  fileName: {
    fontSize: '13px',
    color: '#202124',
    wordBreak: 'break-word',
    marginBottom: '5px',
  },
  fileSize: {
    fontSize: '12px',
    color: '#5f6368',
    marginBottom: '3px',
  },
  fileDate: {
    fontSize: '11px',
    color: '#80868b',
  },
  fileActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  actionButton: {
    padding: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6c757d',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368',
  },
  
  
 filesList: {
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: 'white',
},

fileListItem: {
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #e0e0e0',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#f8f9fa',
  },
  ':last-child': {
    borderBottom: 'none',
  },
},

fileListIcon: {
  fontSize: '32px',
  marginRight: '16px',
  flexShrink: 0,
  width: '40px',
  textAlign: 'center',
},

fileListInfo: {
  flex: 1,
  minWidth: 0, // For text overflow
},

fileListName: {
  fontSize: '15px',
  fontWeight: '500',
  color: '#202124',
  marginBottom: '6px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
},

fileListDetails: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '4px',
},

fileListType: {
  fontSize: '12px',
  backgroundColor: '#f8f9fa',
  padding: '2px 8px',
  borderRadius: '4px',
  fontWeight: 'bold',
  color: '#495057',
},

fileListSize: {
  fontSize: '13px',
  color: '#5f6368',
},

fileListDate: {
  fontSize: '13px',
  color: '#5f6368',
},

fileListOwner: {
  fontSize: '12px',
  color: '#6c757d',
},

fileListActions: {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
}, 
  
  
  
  
};

// Add CSS for hover effects and animations
const addStyles = () => {
  if (!document.getElementById('myfiles-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'myfiles-styles';
    styleSheet.textContent = `
      /* Button hover effects */
      .myfiles-button:hover {
        background-color: #3367d6 !important;
      }
      
      .myfiles-secondary-button:hover {
        background-color: #e8eaed !important;
      }
      
      .myfiles-modal-cancel:hover {
        background-color: #e8eaed !important;
      }
      
      .myfiles-modal-confirm:hover {
        background-color: #3367d6 !important;
      }
      
      .myfiles-modal-confirm:disabled {
        background-color: #cccccc !important;
        cursor: not-allowed !important;
      }
      
      .myfiles-modal-input:focus {
        outline: none;
        border-color: #4285f4 !important;
        box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2) !important;
      }
      
      /* Folder card hover effects */
      .myfiles-folder-card:hover {
        background-color: #f1f3f4 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      }
      
      .myfiles-folder-card {
        transition: all 0.2s !important;
      }
      
      /* Dots button hover */
      .myfiles-dots-button:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
      }
      
      /* Actions menu items */
      .myfiles-menu-item:hover {
        background-color: #f5f5f5 !important;
      }
      
      /* File card hover */
      .myfiles-file-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      
      .myfiles-file-card {
        transition: box-shadow 0.2s !important;
      }
      
      /* Action buttons */
      .myfiles-action-button:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
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
      
      .myfiles-actions-menu {
        animation: fadeIn 0.2s ease-out !important;
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

// Add event listeners for dynamic hover effects
const addHoverListeners = () => {
  // Add hover classes to elements
  const buttons = document.querySelectorAll('[style*="4285f4"]');
  buttons.forEach(btn => {
    if (btn.style.backgroundColor === 'rgb(66, 133, 244)' || 
        btn.style.backgroundColor === '#4285f4') {
      btn.classList.add('myfiles-button');
    }
  });
  
  const secondaryButtons = document.querySelectorAll('[style*="f1f3f4"]');
  secondaryButtons.forEach(btn => {
    if (btn.style.backgroundColor === 'rgb(241, 243, 244)' || 
        btn.style.backgroundColor === '#f1f3f4') {
      btn.classList.add('myfiles-secondary-button');
    }
  });
  
  // Add classes to other elements
  document.querySelectorAll('[style*="border: 1px solid #e0e0e0"]').forEach(el => {
    if (el.style.padding === '20px') {
      el.classList.add('myfiles-folder-card');
    } else if (el.style.padding === '15px') {
      el.classList.add('myfiles-file-card');
    }
  });
  
  // Add class to dots buttons
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent === '⋮' && btn.style.position === 'absolute') {
      btn.classList.add('myfiles-dots-button');
    }
  });
  
  // Add class to actions menu
  document.querySelectorAll('[style*="box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1)"]').forEach(el => {
    if (el.style.minWidth === '120px') {
      el.classList.add('myfiles-actions-menu');
    }
  });
  
  // Add class to menu items
  document.querySelectorAll('[style*="display: flex; align-items: center"]').forEach(el => {
    if (el.style.width === '100%') {
      el.classList.add('myfiles-menu-item');
    }
  });
  
  // Add class to action buttons
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent === '⬇️' || btn.textContent === '☆' || btn.textContent === '★') {
      if (btn.style.backgroundColor === 'transparent') {
        btn.classList.add('myfiles-action-button');
      }
    }
  });
  
  // Add class to modal buttons
  document.querySelectorAll('button').forEach(btn => {
    if (btn.style.backgroundColor === 'rgb(241, 243, 244)' || 
        btn.style.backgroundColor === '#f1f3f4') {
      if (btn.textContent === 'Cancel') {
        btn.classList.add('myfiles-modal-cancel');
      }
    }
    if (btn.style.backgroundColor === 'rgb(66, 133, 244)' || 
        btn.style.backgroundColor === '#4285f4') {
      if (btn.textContent === 'Create Folder' || btn.textContent === 'Rename Folder') {
        btn.classList.add('myfiles-modal-confirm');
      }
    }
  });
  
  // Add class to modal inputs
  document.querySelectorAll('input[type="text"]').forEach(input => {
    if (input.style.border === '1px solid rgb(218, 220, 224)' || 
        input.style.border === '1px solid #dadce0') {
      input.classList.add('myfiles-modal-input');
    }
  });
};

export default MyFiles;