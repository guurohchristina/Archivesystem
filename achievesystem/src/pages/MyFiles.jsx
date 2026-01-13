import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import ShareModal from '../components/ShareModal.jsx';

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { folderId } = useParams(); // Get folder ID from URL
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const API_BASE = 'https://archivesystembackend.onrender.com';

  useEffect(() => {
    if (folderId) {
      fetchFolderContents(folderId);
      fetchFolderInfo(folderId);
    } else {
      fetchRootContents();
    }
    fetchBreadcrumbs();
  }, [folderId]);
  
  
  
  const fetchRootContents = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Please log in to view your files");
    }

    console.log("📡 Fetching ALL user files and folders...");

    // OPTION 1: Try the old reliable endpoint for files
    const filesResponse = await fetch(`${API_BASE}/api/upload`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    // OPTION 2: Try to get folders
    const foldersResponse = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const filesResult = await filesResponse.json();
    const foldersResult = await foldersResponse.json();

    console.log("📦 Files API Response:", filesResult);
    console.log("📁 Folders API Response:", foldersResult);

    // Process files - ALL user files
    if (filesResult.success) {
      // Filter to get only files that are NOT in any folder (folder_id is null or empty)
      const rootFiles = (filesResult.files || []).filter(file => 
        !file.folder_id || file.folder_id === null || file.folder_id === ''
      );
      
      console.log(`📄 Found ${filesResult.files?.length || 0} total files`);
      console.log(`📄 Found ${rootFiles.length} root files (no folder)`);
      
      const transformedFiles = rootFiles.map(file => transformFileData(file));
      setFiles(transformedFiles);
    } else {
      console.error("❌ Failed to fetch files:", filesResult.message);
      setFiles([]);
    }

    // Process folders
    if (foldersResult.success) {
      const transformedFolders = (foldersResult.folders || []).map(folder => ({
        ...folder,
        id: folder.id?.toString() || folder.id,
        isFolder: true
      }));
      setFolders(transformedFolders);
      console.log(`📁 Found ${transformedFolders.length} folders`);
    } else {
      console.error("❌ Failed to fetch folders:", foldersResult.message);
      setFolders([]);
    }

    setCurrentFolder(null); // Root folder

    // Log summary
    console.log(`✅ Loaded ${files.length} files and ${folders.length} folders in root`);

  } catch (error) {
    console.error("❌ Error fetching contents:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const fetchFolderContents = async (folderId) => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem("token");

    console.log(`📡 Fetching contents for folder ID: ${folderId}`);

    // Try multiple approaches to get files in this folder

    // APPROACH 1: Try the new items endpoint
    try {
      const itemsResponse = await fetch(`${API_BASE}/api/upload/items?parent_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (itemsResponse.ok) {
        const itemsResult = await itemsResponse.json();
        console.log(`📦 Items API Response for folder ${folderId}:`, itemsResult);

        if (itemsResult.success) {
          // Transform files
          const transformedFiles = (itemsResult.files || []).map(file => transformFileData(file));
          setFiles(transformedFiles);
          
          // Transform folders
          const transformedFolders = (itemsResult.folders || []).map(folder => ({
            ...folder,
            id: folder.id?.toString() || folder.id,
            isFolder: true
          }));
          setFolders(transformedFolders);
          
          console.log(`✅ Loaded ${transformedFiles.length} files and ${transformedFolders.length} folders from items endpoint`);
          return; // Success, exit early
        }
      }
    } catch (itemsError) {
      console.log("⚠️ Items endpoint failed:", itemsError.message);
    }

    // APPROACH 2: Try the old upload endpoint with folder_id parameter
    try {
      const filesResponse = await fetch(`${API_BASE}/api/upload?folder_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const foldersResponse = await fetch(`${API_BASE}/api/folders?parent_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const filesResult = await filesResponse.json();
      const foldersResult = await foldersResponse.json();

      if (filesResult.success) {
        const transformedFiles = (filesResult.files || []).map(file => transformFileData(file));
        setFiles(transformedFiles);
        console.log(`📄 Loaded ${transformedFiles.length} files from upload endpoint`);
      }

      if (foldersResult.success) {
        const transformedFolders = (foldersResult.folders || []).map(folder => ({
          ...folder,
          id: folder.id?.toString() || folder.id,
          isFolder: true
        }));
        setFolders(transformedFolders);
        console.log(`📁 Loaded ${transformedFolders.length} folders from folders endpoint`);
      }

    } catch (fallbackError) {
      console.error("❌ Fallback endpoints failed:", fallbackError.message);
      setFiles([]);
      setFolders([]);
    }

  } catch (error) {
    console.error("❌ Error fetching folder contents:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
  
  
  
  
  

 {/* const fetchRootContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Please log in to view your files");
      }

      // Fetch files in root
      const filesResponse = await fetch(`${API_BASE}/api/upload?folder_id=root`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Fetch folders in root
      const foldersResponse = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const filesResult = await filesResponse.json();
      const foldersResult = await foldersResponse.json();

      console.log("API Responses:", { filesResult, foldersResult });

      if (filesResult.success) {
        const transformedFiles = (filesResult.files || []).map(file => transformFileData(file));
        setFiles(transformedFiles);
      }

      if (foldersResult.success) {
        setFolders(foldersResult.folders || []);
      }

      setCurrentFolder(null); // Root folder

    } catch (error) {
      console.error("Error fetching contents:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (folderId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      // Fetch files in folder
      const filesResponse = await fetch(`${API_BASE}/api/upload?folder_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Fetch subfolders
      const foldersResponse = await fetch(`${API_BASE}/api/folders?parent_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const filesResult = await filesResponse.json();
      const foldersResult = await foldersResponse.json();

      if (filesResult.success) {
        const transformedFiles = (filesResult.files || []).map(file => transformFileData(file));
        setFiles(transformedFiles);
      }

      if (foldersResult.success) {
        setFolders(foldersResult.folders || []);
      }

    } catch (error) {
      console.error("Error fetching folder contents:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };*/}

  const fetchFolderInfo = async (folderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setCurrentFolder(result.folder);
      }
    } catch (error) {
      console.error("Error fetching folder info:", error);
    }
  };

  const fetchBreadcrumbs = async () => {
    if (!folderId) {
      setBreadcrumbs([{ id: 'root', name: 'My Files' }]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/folders/${folderId}/breadcrumbs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setBreadcrumbs([{ id: 'root', name: 'My Files' }, ...result.breadcrumbs]);
      }
    } catch (error) {
      console.error("Error fetching breadcrumbs:", error);
    }
  };

  const transformFileData = (file) => {
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
  };

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

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Are you sure you want to delete folder "${folder.name}"? This will also delete all contents inside.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/folders/${folder.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        alert("Folder deleted successfully");
        
        // Refresh the current view
        if (folderId) {
          fetchFolderContents(folderId);
        } else {
          fetchRootContents();
        }
      } else {
        alert(result.message || "Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Error deleting folder. Please try again.");
    }
  };

  const handleNavigateToFolder = (folderId) => {
    navigate(`/files/folder/${folderId}`);
  };

  const handleUploadToCurrentFolder = () => {
    navigate(`/upload${folderId ? `?folder=${folderId}` : ''}`);
  };

  // Filter files and folders based on search term
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        // Refresh the current view
        if (folderId) {
          fetchFolderContents(folderId);
        } else {
          fetchRootContents();
        }
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
          onClick={() => folderId ? fetchFolderContents(folderId) : fetchRootContents()}
          style={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Breadcrumbs */}
      <div style={styles.breadcrumbContainer}>
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id}>
            <button
              onClick={() => crumb.id === 'root' ? navigate('/files') : navigate(`/files/folder/${crumb.id}`)}
              style={styles.breadcrumbLink}
            >
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && <span style={styles.breadcrumbSeparator}>/</span>}
          </span>
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            {currentFolder ? currentFolder.name : 'My Files'}
          </h1>
          <div style={styles.filesStats}>
            <span>{files.length + folders.length} items • {formatTotalStorage(totalStorageUsed)} used</span>
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
            onClick={() => setShowCreateFolderModal(true)}
            style={styles.createFolderButton}
          >
            <span style={{ marginRight: '8px' }}>📁</span>
            New Folder
          </button>
          
          <button
            onClick={handleUploadToCurrentFolder}
            style={styles.uploadButton}
          >
            <span style={{ marginRight: '8px' }}>📤</span>
            Upload File
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Folders Grid/List */}
      {filteredFolders.length > 0 && (
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Folders</h3>
        </div>
      )}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
        marginBottom: filteredFolders.length > 0 ? '30px' : '0'
      }}>
        {filteredFolders.map((folder) => (
          <div key={folder.id} style={{
            ...styles.fileItem,
            flexDirection: viewMode === 'grid' ? 'column' : 'row',
            alignItems: viewMode === 'grid' ? 'stretch' : 'center',
            minHeight: viewMode === 'grid' ? '200px' : 'auto',
            padding: viewMode === 'grid' ? '16px' : '12px 16px',
            width: viewMode === 'list' ? '100%' : 'auto',
            maxWidth: viewMode === 'list' ? '100%' : 'none',
            boxSizing: 'border-box',
            cursor: 'pointer'
          }} onClick={() => handleNavigateToFolder(folder.id)}>
            <div style={{
              ...styles.fileIconContainer,
              marginRight: viewMode === 'grid' ? '0' : '12px',
              marginBottom: viewMode === 'grid' ? '12px' : '0',
            }}>
              <span style={{ ...styles.fileTypeIcon, fontSize: viewMode === 'grid' ? '36px' : '24px' }}>📁</span>
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
                {folder.name}
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
                  background: viewMode === 'list' ? 'none' : '#e8f0fe',
                  padding: viewMode === 'list' ? '0' : '3px 8px',
                  fontSize: viewMode === 'grid' ? '11px' : '12px',
                  color: '#4285F4'
                }}>
                  FOLDER
                </span>
                <span style={styles.fileDate}>
                  Created: {new Date(folder.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div style={{
              ...styles.fileActions,
              flexDirection: viewMode === 'grid' ? 'row' : 'row',
              gap: viewMode === 'grid' ? '6px' : '8px',
              marginTop: viewMode === 'grid' ? 'auto' : '0',
              marginLeft: viewMode === 'list' ? '12px' : '0'
            }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder);
                }}
                style={{
                  ...styles.actionBtn,
                  color: '#ea4335',
                  width: viewMode === 'grid' ? '32px' : '36px',
                  height: viewMode === 'grid' ? '32px' : '36px',
                  fontSize: viewMode === 'grid' ? '14px' : '16px'
                }}
                title="Delete Folder"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length > 0 && filteredFolders.length > 0 && (
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Files</h3>
        </div>
      )}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
        overflowX: viewMode === 'list' ? 'hidden' : 'visible'
      }}>
        {filteredFiles.length === 0 && filteredFolders.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>📁</span>
            <h3 style={styles.emptyTitle}>
              {files.length + folders.length === 0 ? "No files or folders yet" : "No matching items found"}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm 
                ? "Try a different search term." 
                : "Upload your first file or create a folder to get started."}
            </p>
            <div style={styles.emptyActions}>
              <button
                onClick={() => setShowCreateFolderModal(true)}
                style={styles.createFolderButton}
              >
                Create First Folder
              </button>
              <button
                onClick={handleUploadToCurrentFolder}
                style={styles.uploadButton}
              >
                Upload First File
              </button>
            </div>
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
                marginRight: viewMode === 'grid' ? '0' : '12px',
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
          Showing {filteredFiles.length + filteredFolders.length} of {files.length + folders.length} items
          {searchTerm && (
            <span style={styles.filteredText}> • Filtered</span>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Create New Folder</h3>
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

      {/* Share Modal */}
      <ShareModal
        file={selectedFile}
        isOpen={shareMenuOpen}
        onClose={handleShareClose}
      />
    </div>
  );
};

// Updated styles
const styles = {
  pageContainer: {
    flex: 1,
    padding: '20px',
    overflowX: 'hidden',
    width: '100%',
    maxWidth: '100%',
  },
  breadcrumbContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '4px',
    padding: '8px 0',
  },
  breadcrumbLink: {
    background: 'none',
    border: 'none',
    color: '#4285F4',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  breadcrumbSeparator: {
    color: '#5f6368',
    margin: '0 4px',
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
    background: '#f1f3f4',
    padding: '4px',
    borderRadius: '8px',
  },
  viewBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  createFolderButton: {
    background: '#ffffff',
    border: '1px solid #dadce0',
    color: '#3c4043',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  uploadButton: {
    background: '#4285F4',
    border: 'none',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  searchSection: {
    marginBottom: '20px',
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '600px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#5f6368',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 42px',
    borderRadius: '8px',
    border: '1px solid #dadce0',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  sectionHeader: {
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#202124',
    margin: 0,
  },
  filesContainer: {
    gap: '12px',
  },
  fileItem: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #dadce0',
    display: 'flex',
    transition: 'all 0.2s',
    position: 'relative',
  },
  fileIconContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileTypeIcon: {
    fontSize: '24px',
  },
  fileStar: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    fontSize: '12px',
  },
  fileShared: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    fontSize: '12px',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    margin: '0 0 4px 0',
  },
  fileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  fileTypeBadge: {
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
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
    marginLeft: '4px',
  },
  fileClassification: {
    marginLeft: '4px',
    fontWeight: '500',
  },
  fileActions: {
    display: 'flex',
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '400',
    color: '#202124',
    margin: '16px 0 8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#5f6368',
    marginBottom: '24px',
  },
  emptyActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #dadce0',
  },
  footerStats: {
    fontSize: '14px',
    color: '#5f6368',
  },
  filteredText: {
    color: '#4285F4',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#202124',
    margin: '0 0 16px',
  },
  modalInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #dadce0',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '20px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalCancel: {
    background: 'transparent',
    border: '1px solid #dadce0',
    color: '#3c4043',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  modalConfirm: {
    background: '#4285F4',
    border: 'none',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f1f3f4',
    borderTop: '4px solid #4285F4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#5f6368',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#202124',
    margin: '0 0 8px',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#5f6368',
    marginBottom: '20px',
    maxWidth: '400px',
  },
  retryButton: {
    background: '#4285F4',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default MyFiles;