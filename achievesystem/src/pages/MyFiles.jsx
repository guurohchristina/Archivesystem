import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const API_BASE = 'https://archivesystembackend.onrender.com';

  useEffect(() => {
    fetchRootContents();
  }, []);

  const fetchRootContents = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Get root files (folder_id is null)
      const filesRes = await fetch(`${API_BASE}/api/upload?folder_id=root`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filesData = await filesRes.json();
      
      console.log("Files response:", filesData);
      
      if (filesData.success) {
        setFiles(filesData.files || []);
      }

      // Get root folders
      const foldersRes = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foldersData = await foldersRes.json();
      
      console.log("Folders response:", foldersData);
      
      if (foldersData.success) {
        setFolders(foldersData.folders || []);
      }
      
    } catch (err) {
      console.error("Error fetching root contents:", err);
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
      console.log("Parent ID: root (since we're at root)");
      
      const response = await fetch(`${API_BASE}/api/folders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parent_id: "root"  // Always "root" for MyFiles page
        })
      });

      const result = await response.json();
      console.log("Create folder response:", result);
      
      if (result.success) {
        alert("Folder created successfully!");
        setShowCreateFolderModal(false);
        setNewFolderName("");
        
        // Refresh the list
        fetchRootContents();
      } else {
        alert(result.message || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder. Please try again.");
    }
  };

  // Test function to debug API
  const testFolderAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Testing folder creation API...");
      
      const response = await fetch(`${API_BASE}/api/folders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "Test Folder " + Date.now(),
          parent_id: "root"
        })
      });

      const result = await response.json();
      console.log("Test API response:", result);
      alert(result.success ? "API Test Passed!" : `API Test Failed: ${result.message}`);
      
    } catch (error) {
      console.error("API Test error:", error);
      alert("API Test failed: " + error.message);
    }
  };

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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
          {/* Debug button - remove in production */}
          <button 
            onClick={testFolderAPI}
            style={{ 
              padding: '10px', 
              backgroundColor: '#ff9800', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              marginLeft: '10px',
              cursor: 'pointer'
            }}
            title="Test API"
          >
            🧪 Test
          </button>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
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
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders Section */}
      {folders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3>Folders ({folders.length})</h3>
          <div style={styles.foldersGrid}>
            {folders.map(folder => (
              <div 
                key={folder.id} 
                style={styles.folderCard}
                onClick={() => navigate(`/files/folder/${folder.id}`)}
              >
                <div style={styles.folderIcon}>📁</div>
                <div style={styles.folderName}>{folder.name}</div>
                <div style={styles.folderDate}>
                  Created: {new Date(folder.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3>Files ({files.length})</h3>
          <div style={styles.filesGrid}>
            {files.map(file => (
              <div key={file.id} style={styles.fileCard}>
                <div style={styles.fileIcon}>
                  {getFileIcon(file.original_name)}
                </div>
                <div style={styles.fileName}>{file.original_name}</div>
                <div style={styles.fileSize}>
                  {formatFileSize(file.file_size)}
                </div>
                <div style={styles.fileDate}>
                  {new Date(file.uploaded_at).toLocaleDateString()}
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

      {/* Debug Info - Remove in production */}
      <div style={{
        marginTop: '40px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Debug Info:</strong>
        <div>Folders: {folders.length}</div>
        <div>Files: {files.length}</div>
        <div>User: {user?.email || "Not logged in"}</div>
      </div>
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
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#f1f3f4',
    color: '#202124',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
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
  },
  folderCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    transition: 'background-color 0.2s, transform 0.2s',
    ':hover': {
      backgroundColor: '#f1f3f4',
      transform: 'translateY(-2px)',
    },
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
  },
  folderDate: {
    fontSize: '12px',
    color: '#5f6368',
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
    transition: 'box-shadow 0.2s',
    ':hover': {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
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
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368',
  },
};

export default MyFiles;