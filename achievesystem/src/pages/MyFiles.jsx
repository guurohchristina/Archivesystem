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
      fetchBreadcrumbs(folderId);
    } else {
      fetchRootContents();
      setBreadcrumbs([{ id: 'root', name: 'My Files' }]);
    }
  }, [folderId]);

 {/* const fetchRootContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Please log in to view your files");
      }

      console.log("🔄 Fetching root contents...");

      // SIMPLE APPROACH: Get files in root (folder_id is null or "root")
      const filesResponse = await fetch(`${API_BASE}/api/upload?folder_id=root`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const filesResult = await filesResponse.json();
      console.log("📦 Files API Result:", filesResult);

      let rootFiles = [];
      if (filesResult.success && filesResult.files) {
        // Filter files that are in root (folder_id is null or "root")
        rootFiles = filesResult.files.filter(file => 
          !file.folder_id || file.folder_id === "root" || file.folder_id === null
        );
        console.log(`📄 Found ${rootFiles.length} files in root`);
      }

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
          console.log(`📁 Found ${rootFolders.length} folders in root`);
        }
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

      console.log("✅ FINAL - Setting state:", {
        filesCount: transformedFiles.length,
        foldersCount: transformedFolders.length
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
  };*/}
  
{/*const fetchRootContents = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Please log in to view your files");
    }

    console.log("🔄 Fetching root contents...");

    // Get ALL files for the user first
    const allFilesResponse = await fetch(`${API_BASE}/api/upload`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const allFilesResult = await allFilesResponse.json();
    console.log("📦 All Files API Result:", allFilesResult);

    let allFiles = [];
    if (allFilesResult.success && allFilesResult.files) {
      allFiles = allFilesResult.files;
    } else if (allFilesResult.success && allFilesResult.data?.files) {
      allFiles = allFilesResult.data.files;
    }

    console.log(`📄 Found ${allFiles.length} total files for user`);

    // Filter to get only root files (folder_id is null or 'root')
    const rootFiles = allFiles.filter(file => {
      const folderId = file.folder_id || file.folder_id;
      return !folderId || folderId === 'root' || folderId === null;
    });

    console.log(`📄 Found ${rootFiles.length} files in root`);

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

    console.log("✅ FINAL - Setting state:", {
      filesCount: transformedFiles.length,
      foldersCount: transformedFolders.length
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
};*/}
  


const fetchRootContents = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Please log in to view your files");
    }

    console.log("🔄 ========= FETCHING ROOT CONTENTS =========");

    // METHOD 1: Try the items endpoint first (files + folders)
    console.log("🔍 Trying /api/upload/items?parent_id=root");
    try {
      const itemsResponse = await fetch(`${API_BASE}/api/upload/items?parent_id=root`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (itemsResponse.ok) {
        const itemsResult = await itemsResponse.json();
        console.log("📦 Items API Result:", itemsResult);

        if (itemsResult.success) {
          // Get files
          let filesData = itemsResult.files || [];
          console.log(`📄 Found ${filesData.length} files from items endpoint`);
          
          // Get folders  
          let foldersData = itemsResult.folders || [];
          console.log(`📁 Found ${foldersData.length} folders from items endpoint`);

          // Transform files
          const transformedFiles = filesData.map(file => {
            console.log(`Processing file: ${file.original_name} (folder_id: ${file.folder_id})`);
            return transformFileData(file);
          });

          // Transform folders
          const transformedFolders = foldersData.map(folder => ({
            id: folder.id?.toString() || folder.id,
            name: folder.name,
            type: "folder",
            owner_id: folder.owner_id,
            parent_id: folder.parent_id,
            created_at: folder.created_at,
            isFolder: true
          }));

          console.log("✅ Setting state from items endpoint:", {
            filesCount: transformedFiles.length,
            foldersCount: transformedFolders.length
          });

          setFiles(transformedFiles);
          setFolders(transformedFolders);
          setCurrentFolder(null);
          
          return; // Success, exit early
        }
      }
    } catch (itemsError) {
      console.log("⚠️ Items endpoint failed:", itemsError.message);
    }

    // METHOD 2: Fallback - Get files and folders separately
    console.log("🔍 Falling back to separate endpoints...");
    
    // Get all files (no filter)
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

    // Filter to get ONLY root files (folder_id is null or empty)
    const rootFiles = allFiles.filter(file => {
      const folderId = file.folder_id || file.folder_id;
      const isRoot = !folderId || folderId === null || folderId === 'null' || folderId === '' || folderId === 'root';
      console.log(`File ${file.id}: folder_id=${folderId}, isRoot=${isRoot}`);
      return isRoot;
    });

    console.log(`📄 Found ${rootFiles.length} files in root folder`);

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
    const transformedFiles = rootFiles.map(file => {
      console.log(`Transforming root file: ${file.original_name}`);
      return transformFileData(file);
    });

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

    console.log("✅ FINAL - Setting state:", {
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
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      console.log(`📡 Fetching contents for folder ID: ${folderId}`);

      // Clear previous contents
      setFiles([]);
      setFolders([]);

      // Get files in this folder
      const filesResponse = await fetch(`${API_BASE}/api/upload?folder_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Get subfolders in this folder
      const foldersResponse = await fetch(`${API_BASE}/api/folders?parent_id=${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const filesResult = await filesResponse.json();
      const foldersResult = await foldersResponse.json();

      console.log("Files response:", filesResult);
      console.log("Folders response:", foldersResult);

      if (filesResult.success) {
        const filesInFolder = filesResult.files || [];
        const transformedFiles = filesInFolder.map(file => transformFileData(file));
        setFiles(transformedFiles);
        console.log(`📄 Loaded ${transformedFiles.length} files in folder`);
      }

      if (foldersResult.success) {
        const foldersInFolder = foldersResult.folders || [];
        const transformedFolders = foldersInFolder.map(folder => ({
          ...folder,
          id: folder.id?.toString() || folder.id,
          isFolder: true
        }));
        setFolders(transformedFolders);
        console.log(`📁 Loaded ${transformedFolders.length} folders in folder`);
      }

      // If both endpoints return empty, check if we're using the right parameter name
      if ((!filesResult.files || filesResult.files.length === 0) && 
          (!foldersResult.folders || foldersResult.folders.length === 0)) {
        console.log("⚠️ Both endpoints returned empty. Trying alternative endpoint...");
        
        // Try alternative endpoint
        try {
          const altResponse = await fetch(`${API_BASE}/api/upload/items?parent_id=${folderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (altResponse.ok) {
            const altResult = await altResponse.json();
            console.log("Alternative endpoint result:", altResult);
            
            if (altResult.success) {
              // Transform files
              const transformedFiles = (altResult.files || []).map(file => transformFileData(file));
              setFiles(transformedFiles);
              
              // Transform folders
              const transformedFolders = (altResult.folders || []).map(folder => ({
                ...folder,
                id: folder.id?.toString() || folder.id,
                isFolder: true
              }));
              setFolders(transformedFolders);
            }
          }
        } catch (altError) {
          console.log("Alternative endpoint also failed:", altError.message);
        }
      }

    } catch (error) {
      console.error("❌ Error fetching folder contents:", error);
      setError("Failed to load folder contents. Please try again.");
    } finally {
      setLoading(false);
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
        setBreadcrumbs([{ id: 'root', name: 'My Files' }, { id: folderId, name: 'Folder' }]);
      }
    } catch (error) {
      console.error("Error fetching breadcrumbs:", error);
      setBreadcrumbs([{ id: 'root', name: 'My Files' }, { id: folderId, name: 'Folder' }]);
    }
  };

 {/* const transformFileData = (file) => {
    // ... keep your existing transformFileData function as is ...
    // Your existing transformFileData function is fine
    // Make sure it properly handles folder_id
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
      owner: file.owner || "Unknown",
      department: file.department || "General",
      classification: file.classification_level || "Unclassified",
      description: file.description || "",
      fileSizeBytes: file.file_size || 0,
      uploadedAt: file.uploaded_at,
      documentType: file.document_type,
      isPublic: file.is_public,
      folderId: file.folder_id ? file.folder_id.toString() : null,
      _apiData: file
    };
  };*/}
  
  
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
  
  // Check if files are actually in the array
  if (files.length > 0) {
    console.log("Sample file:", {
      id: files[0].id,
      name: files[0].name,
      folderId: files[0].folderId,
      type: files[0].type
    });
  } else {
    console.log("❌ No files in state!");
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
    _apiData: file // Keep original data for reference
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
  
  
  
  

{/*  const handleUploadToCurrentFolder = () => {
    navigate(`/upload${folderId ? `?folder=${folderId}` : ''}`);
  };*/}
  
  
  const handleUploadToCurrentFolder = () => {
  // If we're in a folder, upload to that folder
  // If we're in root, upload to root
  if (folderId) {
    navigate(`/upload?folder=${folderId}`);
  } else {
    navigate('/upload'); // No folder parameter for root
  }
};

const refreshCurrentView = () => {
  if (folderId) {
    fetchFolderContents(folderId);
  } else {
    fetchRootContents();
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

  // ... keep your existing handleDelete, handleDownload, etc. functions ...

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
  
          
          
          
          
          
        {/*  <button
            onClick={handleUploadToCurrentFolder}
            style={styles.uploadButton}
          >
            <span style={{ marginRight: '8px' }}>📤</span>
            Upload File
          </button>*/}
          <button
  onClick={handleUploadToCurrentFolder}
  style={styles.uploadButton}
>
  <span style={{ marginRight: '8px' }}>📤</span>
  {folderId ? `Upload to ${currentFolder?.name || 'Folder'}` : 'Upload File'}
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

      {/* Combined Files and Folders Display */}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
        marginBottom: '30px'
      }}>
        {/* Display Folders First */}
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
                    Created: {new Date(folder.created_at).toLocaleDateString()}
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

        {/* Display Files */}
        {filteredFiles.map((file) => (
          <div key={file.id} style={{
            ...styles.fileItem,
            flexDirection: viewMode === 'grid' ? 'column' : 'row',
            alignItems: viewMode === 'grid' ? 'stretch' : 'center',
            minHeight: viewMode === 'grid' ? '200px' : 'auto',
            padding: viewMode === 'grid' ? '16px' : '12px 16px',
            width: viewMode === 'list' ? '100%' : 'auto',
            maxWidth: viewMode === 'list' ? '100%' : 'none',
            boxSizing: 'border-box',
            cursor: 'default'
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
      {filteredFiles.length === 0 && filteredFolders.length === 0 && (
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

// Add your styles object at the end
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
    borderRadius: '4px'
  },
  breadcrumbSeparator: {
    margin: '0 8px',
    color: '#5f6368'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    gap: '12px'
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
    fontSize: '14px'
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
    alignItems: 'center'
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
    alignItems: 'center'
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
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  },
  fileIconContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileTypeIcon: {
    fontSize: '36px'
  },
  fileStar: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    fontSize: '14px'
  },
  fileShared: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    fontSize: '14px'
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
    '&:hover': {
      background: '#e8eaed'
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#5f6368'
  },
  emptyTitle: {
    fontSize: '18px',
    margin: '16px 0 8px',
    color: '#202124'
  },
  emptyText: {
    fontSize: '14px',
    marginBottom: '24px'
  },
  emptyActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
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
    margin: '0 0 16px',
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
    fontSize: '14px'
  },
  modalConfirm: {
    padding: '10px 20px',
    background: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
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
    marginBottom: '20px'
  },
  retryButton: {
    padding: '10px 20px',
    background: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default MyFiles;