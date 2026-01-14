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
    console.log('🔄 useEffect triggered with folderId:', folderId || 'root');
    
    if (folderId) {
      console.log(`📂 Fetching contents for folder: ${folderId}`);
      fetchFolderContents(folderId);
      fetchFolderInfo(folderId);
      fetchBreadcrumbs(folderId);
    } else {
      console.log('📂 Fetching root contents');
      fetchRootContents();
      setBreadcrumbs([{ id: 'root', name: 'My Files' }]);
    }
  }, [folderId]);

  const fetchRootContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Please log in to view your files");
      }

      console.log("🔄 ========= FETCHING ROOT CONTENTS =========");

      // Get ALL files
      console.log("🔍 Getting all files...");
      const filesResponse = await fetch(`${API_BASE}/api/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const filesResult = await filesResponse.json();
      console.log("📦 All Files API Result:", filesResult);

      let allFiles = [];
      if (filesResult.success && filesResult.files) {
        allFiles = filesResult.files;
      } else if (filesResult.success && filesResult.data?.files) {
        allFiles = filesResult.data.files;
      }

      console.log(`📄 Found ${allFiles.length} total files`);

      // Filter for root files (folder_id is null or empty)
      const rootFiles = allFiles.filter(file => {
        const folderId = file.folder_id || file.folder_id;
        const isRoot = !folderId || folderId === null || folderId === 'null' || folderId === '' || folderId === 'root';
        console.log(`File ${file.id}: folder_id=${folderId}, isRoot=${isRoot}`);
        return isRoot;
      });

      console.log(`📄 Showing ${rootFiles.length} files in root`);

      // Get root folders
      let rootFolders = [];
      try {
        const foldersResponse = await fetch(`${API_BASE}/api/folders?parent_id=root`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const foldersResult = await foldersResponse.json();
        console.log("📁 Folders API Result:", foldersResult);

        if (foldersResult.success && foldersResult.folders) {
          rootFolders = foldersResult.folders;
        } else if (foldersResult.success && foldersResult.data) {
          rootFolders = foldersResult.data;
        }
        console.log(`📁 Found ${rootFolders.length} folders in root`);
      } catch (folderError) {
        console.log("⚠️ Could not fetch folders:", folderError.message);
      }

      // Transform files
      const transformedFiles = rootFiles.map(file => transformFileData(file));

      // Transform folders
      const transformedFolders = rootFolders.map(folder => ({
        id: folder.id?.toString() || folder.id,
        name: folder.name,
        type: "folder",
        owner_id: folder.owner_id,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        isFolder: true
      }));

      console.log("✅ Setting state for root:", {
        filesCount: transformedFiles.length,
        foldersCount: transformedFolders.length,
        sampleFile: transformedFiles[0] ? {
          id: transformedFiles[0].id,
          name: transformedFiles[0].name,
          folderId: transformedFiles[0].folderId
        } : 'No files',
        sampleFolder: transformedFolders[0] ? {
          id: transformedFolders[0].id,
          name: transformedFolders[0].name
        } : 'No folders'
      });

      // SET THE STATE
      setFiles(transformedFiles);
      setFolders(transformedFolders);
      setCurrentFolder(null);

    } catch (error) {
      console.error("❌ Error in fetchRootContents:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (folderId) => {
    console.log(`🚀 ========= FETCHING FOLDER ${folderId} CONTENTS =========`);
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Please log in to view files");
      }

      console.log(`📡 Making API calls for folder ${folderId}...`);

      // RESET STATE FIRST
      setFiles([]);
      setFolders([]);

      // Get ALL files first (client-side filtering)
      console.log(`🔍 Getting ALL files and filtering...`);
      
      const allFilesResponse = await fetch(`${API_BASE}/api/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const allFilesResult = await allFilesResponse.json();
      console.log(`📦 ALL Files API Result:`, allFilesResult);

      let allFiles = [];
      if (allFilesResult.success && allFilesResult.files) {
        allFiles = allFilesResult.files;
      } else if (allFilesResult.success && allFilesResult.data?.files) {
        allFiles = allFilesResult.data.files;
      }

      console.log(`📄 Total files available: ${allFiles.length}`);

      // Filter for this folder
      const folderFiles = allFiles.filter(file => {
        const fileFolderId = file.folder_id || file.folder_id;
        console.log(`File ${file.id}: fileFolderId=${fileFolderId}, target=${folderId}, match=${fileFolderId?.toString() === folderId.toString()}`);
        return fileFolderId && fileFolderId.toString() === folderId.toString();
      });

      console.log(`📄 Files in folder ${folderId}: ${folderFiles.length}`);
      
      // Transform files
      const transformedFiles = folderFiles.map(file => {
        console.log(`Transforming file for folder ${folderId}:`, file.original_name);
        return transformFileData(file);
      });

      setFiles(transformedFiles);

      // Get subfolders
      console.log(`🔍 Getting subfolders for folder ${folderId}...`);
      
      try {
        const foldersResponse = await fetch(`${API_BASE}/api/folders?parent_id=${folderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const foldersResult = await foldersResponse.json();
        console.log(`📁 Folders API Response:`, foldersResult);

        let subfolders = [];
        if (foldersResult.success && foldersResult.folders) {
          subfolders = foldersResult.folders;
        } else if (foldersResult.success && foldersResult.data) {
          subfolders = foldersResult.data;
        }

        console.log(`📁 Found ${subfolders.length} subfolders`);

        // Transform folders
        const transformedFolders = subfolders.map(folder => ({
          ...folder,
          id: folder.id?.toString() || folder.id,
          name: folder.name || 'Unnamed Folder',
          type: "folder",
          isFolder: true
        }));

        setFolders(transformedFolders);

      } catch (foldersError) {
        console.log(`⚠️ Could not fetch subfolders:`, foldersError.message);
        setFolders([]);
      }

      console.log(`✅ DONE: Folder ${folderId} has ${transformedFiles.length} files and ${folders.length} subfolders`);

    } catch (error) {
      console.error(`❌ Error fetching folder ${folderId} contents:`, error);
      setError(`Failed to load folder: ${error.message}`);
    } finally {
      setLoading(false);
      console.log(`🏁 ========= FINISHED FETCHING FOLDER ${folderId} =========`);
    }
  };

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
        console.log(`📋 Folder info loaded: ${result.folder.name}`);
      } else {
        console.log(`⚠️ Could not load folder info: ${result.message}`);
      }
    } catch (error) {
      console.error("Error fetching folder info:", error);
    }
  };

  const fetchBreadcrumbs = async (folderId) => {
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
      } else {
        // Fallback: just show current folder
        setBreadcrumbs([{ id: 'root', name: 'My Files' }, { id: folderId, name: currentFolder?.name || 'Folder' }]);
      }
    } catch (error) {
      console.error("Error fetching breadcrumbs:", error);
      setBreadcrumbs([{ id: 'root', name: 'My Files' }, { id: folderId, name: currentFolder?.name || 'Folder' }]);
    }
  };

  const transformFileData = (file) => {
    console.log("🔧 ========= TRANSFORMING FILE =========");
    console.log("Raw file data:", file);
    
    // Check if this is actually a file object
    if (!file || (!file.original_name && !file.original_name)) {
      console.error("❌ Invalid file data received:", file);
      return {
        id: 'invalid',
        name: 'Invalid File',
        type: 'document',
        size: '0 Bytes',
        date: 'Unknown',
        starred: false,
        shared: false,
        owner: 'Unknown',
        department: 'General',
        classification: 'Unclassified',
        folderId: null,
        _apiData: file
      };
    }

    // Determine file type
    let fileType = "document";
    const fileName = (file.original_name || file.original_name || "").toLowerCase();
    const fileMime = (file.filetype || file.mimetype || "").toLowerCase();
    
    if (fileName.includes('.pdf') || fileMime.includes('pdf')) fileType = "pdf";
    else if (fileName.includes('.doc') || fileName.includes('.docx') || fileMime.includes('word')) fileType = "doc";
    else if (fileName.includes('.xls') || fileName.includes('.xlsx') || fileName.includes('.csv') || fileMime.includes('excel') || fileMime.includes('sheet')) fileType = "spreadsheet";
    else if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || fileName.includes('.gif') || fileName.includes('.bmp') || fileMime.includes('image')) fileType = "image";
    else if (fileName.includes('.mp4') || fileName.includes('.mov') || fileName.includes('.avi') || fileName.includes('.mkv') || fileMime.includes('video')) fileType = "video";
    else if (fileName.includes('.mp3') || fileName.includes('.wav') || fileName.includes('.aac') || fileMime.includes('audio')) fileType = "audio";
    else if (fileName.includes('.zip') || fileName.includes('.rar') || fileName.includes('.7z') || fileMime.includes('archive') || fileMime.includes('compressed')) fileType = "archive";
    
    // Format date
    let relativeDate = "Recently";
    const dateField = file.uploaded_at || file.created_at || file.uploaded_at;
    if (dateField) {
      try {
        const date = new Date(dateField);
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
      } catch (dateError) {
        console.log("⚠️ Could not parse date:", dateField);
      }
    }

    // Format file size
    let formattedSize = "0 Bytes";
    if (file.file_size) {
      try {
        const bytes = parseInt(file.file_size);
        if (bytes > 0) {
          const k = 1024;
          const sizes = ["Bytes", "KB", "MB", "GB"];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
        }
      } catch (sizeError) {
        console.log("⚠️ Could not parse file size:", file.file_size);
      }
    }
    
    // Handle folder_id
    const folderIdValue = file.folder_id || file.folder_id;
    console.log(`File ${file.id} folder_id analysis:`, {
      raw: file.folder_id,
      value: folderIdValue,
      type: typeof folderIdValue
    });

    // Create transformed file
    const transformed = {
      id: file.id?.toString() || file.id || `temp-${Date.now()}`,
      name: file.original_name || file.original_name || "Unnamed File",
      type: fileType,
      size: formattedSize,
      date: relativeDate,
      starred: false,
      shared: file.is_public || file.is_public || false,
      owner: file.owner || file.owner_name || "Unknown",
      department: file.department || "General",
      classification: file.classification_level || "Unclassified",
      description: file.description || "",
      fileSizeBytes: file.file_size || 0,
      uploadedAt: file.uploaded_at || file.created_at,
      documentType: file.document_type,
      isPublic: file.is_public || file.is_public,
      folderId: folderIdValue ? folderIdValue.toString() : null,
      _apiData: file
    };
    
    console.log(`✅ Transformed file:`, {
      id: transformed.id,
      name: transformed.name,
      folderId: transformed.folderId,
      type: transformed.type
    });
    
    return transformed;
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      console.log('📁 Creating folder:', {
        name: newFolderName.trim(),
        parent_id: folderId || "root",
        currentFolderId: folderId
      });
      
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
      console.log('Create folder response:', result);
      
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
    console.log(`📂 ========= NAVIGATING TO FOLDER =========`);
    console.log(`Folder ID: ${folderId}`);
    console.log(`Navigating to: /files/folder/${folderId}`);
    
    // Navigate
    navigate(`/files/folder/${folderId}`);
  };

  const handleUploadToCurrentFolder = () => {
    // If we're in a folder, upload to that folder
    // If we're in root, upload to root
    if (folderId) {
      navigate(`/upload?folder=${folderId}`);
    } else {
      navigate('/upload');
    }
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

  // Debug function
  const debugCurrentState = () => {
    console.log("🔍 ========= CURRENT STATE DEBUG =========");
    console.log("Files array length:", files.length);
    console.log("Files array:", files);
    console.log("Folders array length:", folders.length);
    console.log("Folders array:", folders);
    console.log("Current folder ID:", folderId);
    console.log("Current folder info:", currentFolder);
    console.log("Loading:", loading);
    console.log("Error:", error);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>
          {folderId ? `Loading "${currentFolder?.name || 'folder'}..."` : "Loading your files..."}
        </p>
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
              onClick={() => {
                if (crumb.id === 'root') {
                  navigate(':/files');
                } else {
                  navigate(`/files/folder/${crumb.id}`);
                }
              }}
              style={styles.breadcrumbLink}
            >
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && <span style={styles.breadcrumbSeparator}>/</span>}
          </span>
        ))}
        {currentFolder && (
          <span style={{ color: '#5f6368', marginLeft: '8px', fontSize: '14px' }}>
            ({files.length + folders.length} items)
          </span>
        )}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            {currentFolder ? `📁 ${currentFolder.name}` : '📂 My Files'}
            {folderId && (
              <span style={{
                fontSize: '14px',
                color: '#5f6368',
                marginLeft: '10px',
                fontWeight: 'normal'
              }}>
                (ID: {folderId})
              </span>
            )}
          </h1>
          <div style={styles.filesStats}>
            <span>
              {files.length + folders.length} items
              {files.length > 0 && ` • ${files.length} files`}
              {folders.length > 0 && ` • ${folders.length} folders`}
              {files.length > 0 && ` • ${formatTotalStorage(totalStorageUsed)} used`}
            </span>
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
            {folderId ? 'New Subfolder' : 'New Folder'}
          </button>
          
          <button
            onClick={handleUploadToCurrentFolder}
            style={styles.uploadButton}
          >
            <span style={{ marginRight: '8px' }}>📤</span>
            {folderId ? 'Upload to Folder' : 'Upload File'}
          </button>

          {/* Debug button (remove in production) */}
          <button
            onClick={debugCurrentState}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f1f3f4',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
            title="Debug State"
          >
            🐛
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
          <h3 style={styles.sectionTitle}>
            {folderId ? 'Subfolders' : 'Folders'}
            <span style={{ fontSize: '14px', color: '#5f6368', marginLeft: '8px', fontWeight: 'normal' }}>
              ({filteredFolders.length})
            </span>
          </h3>
        </div>
      )}
      {filteredFolders.length > 0 && (
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
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              ':hover': {
                backgroundColor: '#f1f3f4'
              }
            }} onClick={() => handleNavigateToFolder(folder.id)}>
              <div style={{
                ...styles.fileIconContainer,
                marginRight: viewMode === 'grid' ? '0' : '12px',
                marginBottom: viewMode === 'grid' ? '12px' : '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: viewMode === 'grid' ? '48px' : '36px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  📁
                </div>
              </div>
              
              <div style={{
                ...styles.fileInfo,
                flex: viewMode === 'list' ? 1 : 'none',
                minWidth: 0,
                overflow: 'hidden',
                textAlign: viewMode === 'grid' ? 'center' : 'left'
              }}>
                <h3 style={{
                  ...styles.fileName,
                  whiteSpace: viewMode === 'list' ? 'nowrap' : 'normal',
                  overflow: viewMode === 'list' ? 'hidden' : 'visible',
                  textOverflow: viewMode === 'list' ? 'ellipsis' : 'clip',
                  marginBottom: viewMode === 'grid' ? '8px' : '4px'
                }}>
                  {folder.name}
                </h3>
                <div style={{
                  ...styles.fileMeta,
                  display: 'flex',
                  alignItems: 'center',
                  gap: viewMode === 'list' ? '12px' : '6px',
                  flexWrap: viewMode === 'grid' ? 'wrap' : 'nowrap',
                  justifyContent: viewMode === 'grid' ? 'center' : 'flex-start'
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
                  {folder.created_at && (
                    <span style={styles.fileDate}>
                      {new Date(folder.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{
                ...styles.fileActions,
                flexDirection: viewMode === 'grid' ? 'row' : 'row',
                gap: viewMode === 'grid' ? '6px' : '8px',
                marginTop: viewMode === 'grid' ? 'auto' : '0',
                marginLeft: viewMode === 'list' ? '12px' : '0',
                justifyContent: viewMode === 'grid' ? 'center' : 'flex-end'
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
      )}

      {/* Files Grid/List */}
      {filteredFiles.length > 0 && filteredFolders.length > 0 && (
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>
            Files
            <span style={{ fontSize: '14px', color: '#5f6368', marginLeft: '8px', fontWeight: 'normal' }}>
              ({filteredFiles.length})
            </span>
          </h3>
        </div>
      )}
      
      {/* Combined Display for files and empty state */}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
        overflowX: viewMode === 'list' ? 'hidden' : 'visible'
      }}>
        {/* Display files */}
        {filteredFiles.map((file) => (
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
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}>
              <span style={{
                fontSize: viewMode === 'grid' ? '36px' : '24px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {getFileIcon(file.type)}
              </span>
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
              overflow: 'hidden',
              textAlign: viewMode === 'grid' ? 'center' : 'left'
            }}>
              <h3 style={{
                ...styles.fileName,
                whiteSpace: viewMode === 'list' ? 'nowrap' : 'normal',
                overflow: viewMode === 'list' ? 'hidden' : 'visible',
                textOverflow: viewMode === 'list' ? 'ellipsis' : 'clip',
                marginBottom: viewMode === 'grid' ? '8px' : '4px'
              }}>
                {file.name}
              </h3>
              <div style={{
                ...styles.fileMeta,
                display: 'flex',
                alignItems: 'center',
                gap: viewMode === 'list' ? '12px' : '6px',
                flexWrap: viewMode === 'grid' ? 'wrap' : 'nowrap',
                justifyContent: viewMode === 'grid' ? 'center' : 'flex-start'
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
              
              {/* Additional info for list view */}
              {viewMode === 'list' && (
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
              )}
            </div>
            
            <div style={{
              ...styles.fileActions,
              flexDirection: viewMode === 'grid' ? 'row' : 'row',
              gap: viewMode === 'grid' ? '6px' : '8px',
              marginTop: viewMode === 'grid' ? 'auto' : '0',
              marginLeft: viewMode === 'list' ? '12px' : '0',
              justifyContent: viewMode === 'grid' ? 'center' : 'flex-end'
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
        ))}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && filteredFolders.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            {folderId ? '📁' : '📂'}
          </div>
          <h3 style={styles.emptyTitle}>
            {folderId 
              ? `"${currentFolder?.name || 'This folder'}" is empty`
              : 'Welcome to My Files'}
          </h3>
          <p style={styles.emptyText}>
            {folderId
              ? 'Upload files here or create subfolders to organize your content'
              : 'Get started by uploading files or creating folders to organize your documents'}
          </p>
          <div style={styles.emptyActions}>
            <button
              onClick={() => {
                if (folderId) {
                  navigate(`/upload?folder=${folderId}`);
                } else {
                  navigate('/upload');
                }
              }}
              style={{
                ...styles.uploadButton,
                padding: '12px 24px',
                fontSize: '16px'
              }}
            >
              <span style={{ marginRight: '8px' }}>📤</span>
              {folderId ? 'Upload Files Here' : 'Upload Your First File'}
            </button>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              style={{
                ...styles.createFolderButton,
                padding: '12px 24px',
                fontSize: '16px'
              }}
            >
              <span style={{ marginRight: '8px' }}>📁</span>
              {folderId ? 'Create Subfolder' : 'Create Your First Folder'}
            </button>
          </div>
          
          {folderId && (
            <div style={{
              marginTop: '30px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              maxWidth: '500px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#202124' }}>
                📍 You are here:
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#5f6368'
              }}>
                <span>My Files</span>
                <span>›</span>
                <span>{currentFolder?.name || 'Folder'}</span>
              </div>
            </div>
          )}
        </div>
      )}

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
            <h3 style={styles.modalTitle}>
              {folderId ? 'Create Subfolder' : 'Create New Folder'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#5f6368',
              margin: '0 0 12px 0'
            }}>
              {folderId 
                ? `This folder will be created inside "${currentFolder?.name || 'current folder'}"`
                : 'This folder will be created in My Files'}
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
                {folderId ? 'Create Subfolder' : 'Create Folder'}
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

// Styles object
const styles = {
  pageContainer: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  breadcrumbContainer: {
    marginBottom: '20px',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0'
  },
  breadcrumbLink: {
    background: 'none',
    border: 'none',
    color: '#4285F4',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 8px',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: '#f1f3f4'
    }
  },
  breadcrumbSeparator: {
    margin: '0 8px',
    color: '#5f6368'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    color: '#202124'
  },
  filesStats: {
    color: '#5f6368',
    fontSize: '14px',
    marginTop: '4px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  viewControls: {
    display: 'flex',
    gap: '4px',
    background: '#f1f3f4',
    padding: '4px',
    borderRadius: '8px'
  },
  viewBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.8)'
    }
  },
  createFolderButton: {
    padding: '10px 16px',
    background: '#f1f3f4',
    border: 'none',
    borderRadius: '8px',
    color: '#202124',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: '#e8eaed'
    }
  },
  uploadButton: {
    padding: '10px 16px',
    background: '#4285F4',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: '#3367d6'
    }
  },
  searchSection: {
    marginBottom: '20px'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: '#f1f3f4',
    borderRadius: '8px',
    padding: '8px 16px',
    maxWidth: '500px'
  },
  searchIcon: {
    marginRight: '12px',
    color: '#5f6368'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    outline: 'none'
  },
  sectionHeader: {
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e0e0e0'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#202124',
    margin: 0
  },
  filesContainer: {
    gap: '16px',
    marginBottom: '30px'
  },
  fileItem: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    padding: '16px',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  },
  fileIconContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileStar: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    fontSize: '14px',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '2px'
  },
  fileShared: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    fontSize: '14px',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '2px'
  },
  fileInfo: {
    flex: 1,
    minWidth: 0
  },
  fileName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'normal',
    color: '#202124',
    wordBreak: 'break-word'
  },
  fileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px'
  },
  fileTypeBadge: {
    background: '#f1f3f4',
    color: '#5f6368',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  fileSize: {
    fontSize: '12px',
    color: '#5f6368'
  },
  fileDate: {
    fontSize: '12px',
    color: '#5f6368'
  },
  fileDetails: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#5f6368'
  },
  fileOwner: {
    marginRight: '8px'
  },
  fileDepartment: {
    marginLeft: '4px',
    color: '#4285F4'
  },
  fileClassification: {
    marginLeft: '8px',
    fontWeight: 'bold'
  },
  fileActions: {
    display: 'flex',
    alignItems: 'center'
  },
  actionBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: '#f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'all 0.2s',
    ':hover': {
      background: '#e8eaed'
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368',
    maxWidth: '600px',
    margin: '0 auto'
  },
  emptyTitle: {
    fontSize: '20px',
    margin: '16px 0 8px',
    color: '#202124'
  },
  emptyText: {
    fontSize: '14px',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  emptyActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    color: '#5f6368',
    fontSize: '14px'
  },
  footerStats: {
    textAlign: 'center'
  },
  filteredText: {
    color: '#4285F4'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    minWidth: '400px',
    maxWidth: '500px'
  },
  modalTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    color: '#202124'
  },
  modalInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  modalCancel: {
    padding: '10px 20px',
    border: '1px solid #e0e0e0',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  modalConfirm: {
    padding: '10px 20px',
    background: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#3367d6'
    }
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4285F4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: '#5f6368'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  errorTitle: {
    fontSize: '18px',
    margin: '0 0 8px',
    color: '#202124'
  },
  errorMessage: {
    color: '#5f6368',
    marginBottom: '20px',
    maxWidth: '400px'
  },
  retryButton: {
    padding: '10px 20px',
    background: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#3367d6'
    }
  }
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default MyFiles;