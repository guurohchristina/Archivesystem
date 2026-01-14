import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      if (filesData.success) {
        setFiles(filesData.files || []);
      }

      // Get root folders
      const foldersRes = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foldersData = await foldersRes.json();
      
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

{/*  const handleCreateFolder = () => {
    navigate('/files?action=create-folder'); // Or implement modal
  };*/}

{/*const handleCreateFolder = async () => {
  if (!newFolderName.trim()) {
    alert("Please enter a folder name");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    
    // ALWAYS send parent_id, even if it's root
    const parentId = folderId || "root";
    
    console.log("📁 Creating folder with:", {
      name: newFolderName.trim(),
      parent_id: parentId,
      location: folderId ? `Inside folder ${folderId}` : "At root"
    });
    
    const response = await fetch(`${API_BASE}/api/folders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newFolderName.trim(),
        parent_id: parentId
      })
    });

    const result = await response.json();
    console.log("📁 API Response:", result);
    
    if (result.success) {
      alert(`Folder "${newFolderName.trim()}" created successfully!`);
      setShowCreateFolderModal(false);
      setNewFolderName("");
      
      // Refresh based on current location
      if (folderId) {
        // We're inside a folder
        console.log("Refreshing folder contents for:", folderId);
        fetchFolderContents(folderId);
      } else {
        // We're at root
        console.log("Refreshing root contents");
        fetchRootContents();
      }
    } else {
      // Show specific error from backend
      const errorMsg = result.message || "Failed to create folder";
      alert(`Error: ${errorMsg}`);
    }
  } catch (error) {
    console.error("❌ Error creating folder:", error);
    alert("Network error. Please check your connection and try again.");
  }
};*/}


const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name");
      return;
    }

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
      console.log("Create folder response:", result);
      
      if (result.success) {
        alert("Folder created successfully");
        setShowCreateFolderModal(false);
        setNewFolderName("");
        
        // Refresh the current view
        if (folderId) {
          fetchFolderContents(folderId);
        } else {
          fetchRootContents();
        }
      } else {
        alert(result.message || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder. Please try again.");
    }
  };








  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>📂 My Files</h1>
        <div>
          <button onClick={handleUpload} style={styles.button}>
            📤 Upload File
          </button>
          <button onClick={handleCreateFolder} style={styles.secondaryButton}>
            📁 New Folder
          </button>
        </div>
      </div>

      {/* Folders */}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div>
          <h3>Files ({files.length})</h3>
          <div style={styles.filesGrid}>
            {files.map(file => (
              <div key={file.id} style={styles.fileCard}>
                <div style={styles.fileIcon}>
                  {file.original_name?.includes('.pdf') ? '📄' : '📎'}
                </div>
                <div style={styles.fileName}>{file.original_name}</div>
                <div style={styles.fileSize}>
                  {Math.round(file.file_size / 1024)} KB
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
            <button onClick={handleCreateFolder} style={styles.secondaryButton}>
              📁 Create Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f1f3f4',
    },
  },
  folderIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  folderName: {
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
  },
  fileName: {
    fontSize: '13px',
    color: '#202124',
    wordBreak: 'break-word',
  },
  fileSize: {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '5px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368',
  },
};

export default MyFiles;