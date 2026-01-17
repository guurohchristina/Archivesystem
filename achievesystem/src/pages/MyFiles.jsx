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
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(null); // folderId or null
  const [showEditModal, setShowEditModal] = useState(false);

  const API_BASE = 'https://archivesystembackend.onrender.com';

  useEffect(() => {
    fetchRootContents();
  
  }, []);

{/*  const fetchRootContents = async () => {
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
  };*/}
  
  
{/*const fetchRootContents = async () => {
  try {
    const token = localStorage.getItem("token");
    
    console.log("🔍 Fetching root contents...");
    
    // 1. Get ALL user files (original working endpoint)
    const filesRes = await fetch(`${API_BASE}/api/upload`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const filesData = await filesRes.json();
    console.log("📦 Files API Response:", {
      success: filesData.success,
      totalFiles: filesData.files?.length || 0,
      message: filesData.message
    });
    
    let rootFiles = [];
    
    if (filesData.success) {
      const allFiles = filesData.files || [];
      
      // Filter for root files only
      rootFiles = allFiles.filter(file => {
        const folderId = file.folder_id || file.folderId;
        const isRoot = !folderId || folderId === null || folderId === 'null' || 
                      folderId === '' || folderId === 'root';
        console.log(`File ${file.id}: folder_id="${folderId}", isRoot=${isRoot}`);
        return isRoot;
      });
      
      console.log(`📄 Found ${rootFiles.length} root files out of ${allFiles.length} total files`);
      
      // Transform root files (use your original transformation code)
      const transformedFiles = rootFiles.map(file => {
        // Copy your transformation logic from fetchUserFiles
        let fileType = "document";
        const fileName = file.original_name?.toLowerCase() || "";
        const fileMime = file.filetype?.toLowerCase() || "";
        
        // File type detection...
        if (fileName.includes('.pdf') || fileMime.includes('pdf')) fileType = "pdf";
        // ... rest of your transformation code
        
        return {
          id: file.id,
          name: file.original_name || "Unnamed File",
          type: fileType,
          // ... rest of your properties
          _apiData: file
        };
      });
      
      setFiles(transformedFiles);
    } else {
      console.error("Files API error:", filesData.message);
      setFiles([]);
    }

    // 2. Get root folders
    const foldersRes = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const foldersData = await foldersRes.json();
    console.log("📁 Folders API Response:", {
      success: foldersData.success,
      foldersCount: foldersData.folders?.length || 0
    });
    
    if (foldersData.success) {
      setFolders(foldersData.folders || []);
    } else {
      console.error("Folders API error:", foldersData.message);
      setFolders([]);
    }
    
  } catch (err) {
    console.error("❌ Error fetching root contents:", err);
  } finally {
    setLoading(false);
  }
};*/}


{/*const fetchRootContents = async () => {
  try {
    const token = localStorage.getItem("token");
    
    console.log("🔍 Fetching root contents...");
    
    // 1. Get ALL user files (original working endpoint)
    const filesRes = await fetch(`${API_BASE}/api/upload/user`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const filesData = await filesRes.json();
    console.log("📦 Files API Response:", {
      success: filesData.success,
      totalFiles: filesData.files?.length || 0,
      message: filesData.message
    });
    
    let rootFiles = [];
    
    if (filesData.success) {
      const allFiles = filesData.files || [];
      
      // Filter for root files only
      rootFiles = allFiles.filter(file => {
        const folderId = file.folder_id || file.folderId;
        const isRoot = !folderId || folderId === null || folderId === 'null' || 
                      folderId === '' || folderId === 'root';
        console.log(`File ${file.id}: folder_id="${folderId}", isRoot=${isRoot}`);
        return isRoot;
      });
      
      console.log(`📄 Found ${rootFiles.length} root files out of ${allFiles.length} total files`);
      
      // ============= COMPLETE TRANSFORMATION CODE =============
      const transformedFiles = rootFiles.map(file => {
        // Determine file type from filename or filetype
        let fileType = "document";
        const fileName = (file.original_name || "").toLowerCase();
        const fileMime = (file.filetype || "").toLowerCase();
        
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
        
        // Create the transformed file object
        return {
          id: file.id?.toString() || file.id,
          name: file.original_name || "Unnamed File",
          type: fileType,
          size: formattedSize,
          date: relativeDate,
          starred: false, // Default to not starred
          shared: file.is_public || false,
          owner: file.owner || file.owner_name || "You",
          department: file.department || "General",
          classification: file.classification_level || "Unclassified",
          description: file.description || "",
          fileSizeBytes: file.file_size || 0,
          uploadedAt: file.uploaded_at,
          documentType: file.document_type,
          isPublic: file.is_public || false,
          folderId: file.folder_id ? file.folder_id.toString() : null,
          // Keep original API data for download/delete operations
          _apiData: file
        };
      });
      // ============= END OF TRANSFORMATION CODE =============
      
      console.log("✅ Transformed files:", transformedFiles.length);
      setFiles(transformedFiles);
    } else {
      console.error("Files API error:", filesData.message);
      setFiles([]);
    }

    // 2. Get root folders
    const foldersRes = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const foldersData = await foldersRes.json();
    console.log("📁 Folders API Response:", {
      success: foldersData.success,
      foldersCount: foldersData.folders?.length || 0
    });
    
    if (foldersData.success) {
      // Transform folders if needed
      const transformedFolders = (foldersData.folders || []).map(folder => ({
        id: folder.id?.toString() || folder.id,
        name: folder.name || "Unnamed Folder",
        type: "folder",
        owner_id: folder.owner_id,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        isFolder: true
      }));
      
      setFolders(transformedFolders);
    } else {
      console.error("Folders API error:", foldersData.message);
      setFolders([]);
    }
    
  } catch (err) {
    console.error("❌ Error fetching root contents:", err);
    setError("Failed to load files and folders. Please try again.");
  } finally {
    setLoading(false);
  }
};*/}







{/*const fetchRootContents = async () => {
  try {
    const token = localStorage.getItem("token");
    
    console.log("🔍 Fetching root contents...");
    
    // 1. Get ALL files
    const filesRes = await fetch(`${API_BASE}/api/upload`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const filesData = await filesRes.json();
    console.log("📦 Files API Response received");
    
    if (filesData.success) {
      const allFiles = filesData.files || [];
      console.log(`📦 Total files from API: ${allFiles.length}`);
      
      // DEBUG: Log first few files
      allFiles.slice(0, 3).forEach((file, i) => {
        console.log(`File ${i}:`, {
          id: file.id,
          name: file.original_name,
          folder_id: file.folder_id,
          type: typeof file.folder_id
        });
      });
      
      // CORRECTED: Filter for root files
      const rootFiles = allFiles.filter(file => {
        const folderId = file.folder_id;
        
        // Accept ALL representations of "root"
        if (folderId === null || folderId === undefined) {
          return true; // NULL or undefined = root
        }
        
        const folderIdStr = String(folderId).toLowerCase().trim();
        
        // Check for various "root" representations
        if (folderIdStr === 'root' || 
            folderIdStr === '' || 
            folderIdStr === 'null' ||
            folderIdStr === '0') {
          return true;
        }
        
        return false;
      });
      
      console.log(`✅ Filtered: ${rootFiles.length} root files`);
      
      // Transform the filtered files
      const transformedFiles = rootFiles.map(file => {
        // Determine file type
        let fileType = "document";
        const fileName = (file.original_name || "").toLowerCase();
        
        if (fileName.includes('.pdf')) fileType = "pdf";
        else if (fileName.includes('.doc')) fileType = "doc";
        else if (fileName.includes('.xls') || fileName.includes('.xlsx') || fileName.includes('.csv')) fileType = "spreadsheet";
        else if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || fileName.includes('.gif')) fileType = "image";
        else if (fileName.includes('.mp4') || fileName.includes('.mov') || fileName.includes('.avi')) fileType = "video";
        else if (fileName.includes('.zip') || fileName.includes('.rar')) fileType = "archive";
        
        // Format date
        let relativeDate = "Recently";
        if (file.uploaded_at) {
          const date = new Date(file.uploaded_at);
          const now = new Date();
          const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) relativeDate = "Today";
          else if (diffDays === 1) relativeDate = "Yesterday";
          else if (diffDays < 7) relativeDate = `${diffDays} days ago`;
          else if (diffDays < 30) relativeDate = `${Math.floor(diffDays / 7)} weeks ago`;
          else {
            relativeDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
        }
        
        // Format size
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
          id: file.id?.toString() || file.id,
          name: file.original_name || "Unnamed File",
          type: fileType,
          size: formattedSize,
          date: relativeDate,
          starred: false,
          shared: file.is_public || false,
          owner: "You",
          department: file.department || "General",
          classification: file.classification_level || "Unclassified",
          fileSizeBytes: file.file_size || 0,
          uploadedAt: file.uploaded_at,
          _apiData: file,
          folderId: file.folder_id // Keep this for debugging
        };
      });
      
      console.log(`🎯 Setting ${transformedFiles.length} files to state`);
      setFiles(transformedFiles);
    } else {
      console.error("❌ Files API error:", filesData.message);
      setFiles([]);
    }

    // 2. Get root folders
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
    
  } catch (err) {
    console.error("❌ Error in fetchRootContents:", err);
  } finally {
    setLoading(false);
  }
};*/}






const fetchRootContents = async () => {
  try {
    const token = localStorage.getItem("token");
    
    console.log("🔍 Fetching root contents...");
    
    // Get root folders AND files in one API call
    const contentRes = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const contentData = await contentRes.json();
    console.log("📦 API Response:", {
      success: contentData.success,
      foldersCount: contentData.folders?.length || 0,
      filesCount: contentData.files?.length || 0
    });
    
    if (contentData.success) {
      // Handle folders
      const folders = contentData.folders || [];
      console.log(`📁 Setting ${folders.length} folders`);
      setFolders(folders);
      
      // Handle files - KEEP original API structure for rendering
      const apiFiles = contentData.files || [];
      console.log(`📦 Setting ${apiFiles.length} files directly from API`);
      
      // Use files directly from API (no transformation needed)
      setFiles(apiFiles);
    } else {
      console.error("❌ Content API error:", contentData.message);
      setFolders([]);
      setFiles([]);
    }
    
  } catch (err) {
    console.error("❌ Error in fetchRootContents:", err);
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
        
        // Refresh the list
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
        setShowActionsMenu(null); // Close the menu
        fetchRootContents(); // Refresh
      } else {
        alert(result.message || "Failed to delete folder");
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("Error deleting folder. Please try again.");
    }
  };

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setShowEditModal(true);
    setShowActionsMenu(null); // Close the actions menu
  };

  const openActionsMenu = (e, folderId) => {
    e.stopPropagation(); // Prevent folder click
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
                <div style={styles.folderContent}>
                  <div style={styles.folderIcon}>📁</div>
                  <div style={styles.folderName}>{folder.name}</div>
                  <div style={styles.folderDate}>
                    Created: {new Date(folder.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Three Dots Menu Button */}
                <button
                  onClick={(e) => openActionsMenu(e, folder.id)}
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
      )}

      {/* Files Section */}
      {/*{files.length > 0 && (
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
      )}*/}
      
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
          <div style={styles.fileName}>
            {file.original_name}
          </div>
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
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#3367d6',
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
    transition: 'border-color 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4285f4',
      boxShadow: '0 0 0 2px rgba(66, 133, 244, 0.2)',
    },
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
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e8eaed',
    },
  },
  modalConfirm: {
    padding: '8px 16px',
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
    transition: 'all 0.2s',
    cursor: 'pointer',
    position: 'relative',
    ':hover': {
      backgroundColor: '#f1f3f4',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
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
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
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
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
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

// Add CSS for the dots button
const addStyles = () => {
  if (!document.getElementById('myfiles-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'myfiles-styles';
    styleSheet.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .actions-menu {
        animation: fadeIn 0.2s ease-out;
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

addStyles();

export default MyFiles;