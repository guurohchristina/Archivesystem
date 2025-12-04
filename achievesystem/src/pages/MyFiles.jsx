
// src/pages/MyFiles.jsx
/*import { AuthContext } from "../context/AuthContext.jsx";

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchUserFiles();
  }, [currentPage, sortBy]);

  const fetchUserFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/upload/my-files?page=${currentPage}&limit=10&sort=${sortBy}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setFiles(result.data.files);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('File deleted successfully');
        fetchUserFiles(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="page">
      <h1>My Files</h1>
      
      <div className="files-header">
        <div className="sort-options">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">Size (Largest)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="no-files">
          <p>You haven't uploaded any files yet.</p>
          <button onClick={() => window.location.href = '/upload'}>
            Upload Your First File
          </button>
        </div>
      ) : (
        <>
          <div className="files-list">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-icon">
                  {file.file_type.startsWith('image/') ? '🖼️' : 
                   file.file_type.includes('pdf') ? '📄' :
                   file.file_type.includes('video') ? '🎬' :
                   file.file_type.includes('audio') ? '🎵' : '📁'}
                </div>
                
                <div className="file-info">
                  <h3>{file.original_name}</h3>
                  <div className="file-meta">
                    <span>Size: {formatFileSize(file.file_size)}</span>
                    <span>Type: {file.file_type}</span>
                    <span>Uploaded: {formatDate(file.uploaded_at)}</span>
                  </div>
                  {file.description && (
                    <p className="file-description">{file.description}</p>
                  )}
                </div>
                
                <div className="file-actions">
                  <a 
                    href={`/uploads/${file.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn view-btn"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="action-btn delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>


          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span>Page {currentPage} of {totalPages}</span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyFiles;*/







/*
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [classifications, setClassifications] = useState([
    "Unclassified",
    "Confidential",
    "Secret",
    "Top Secret"
  ]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorage: 0,
    filesByType: []
  });

  useEffect(() => {
    fetchUserFiles();
    fetchStats();
    fetchDepartments();
  }, [currentPage, sortBy, departmentFilter, classificationFilter]);

  const fetchUserFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/upload/my-files?page=${currentPage}&limit=10&sort=${sortBy}`;
    
      
      if (departmentFilter) url += `&department=${departmentFilter}`;
      if (classificationFilter) url += `&classification=${classificationFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setFiles(result.data.files);
        setTotalPages(result.data.pagination.totalPages);
        setTotalFiles(result.data.pagination.totalFiles);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("Failed to load files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/upload/stats/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/upload/departments/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/upload/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert("File deleted successfully");
        fetchUserFiles(); // Refresh list
        fetchStats(); // Refresh stats
      } else {
        alert(result.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  const handleEdit = (fileId) => {
    // You can implement an edit modal or redirect to edit page
    navigate(`/edit-file/${fileId}`);
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/upload/${fileId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📁";

    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document"))
      return "📝";
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return "📊";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("zip") || fileType.includes("rar"))
      return "🗜️";
    if (fileType.includes("text")) return "📃";
    return "📁";
  };

  const getClassificationColor = (level) => {
    switch (level) {
      case "Top Secret":
        return "bg-red-100 text-red-800 border-red-200";
      case "Secret":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Confidential":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Unclassified":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const clearFilters = () => {
    setDepartmentFilter("");
    setClassificationFilter("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="page">
      <h1>My Files</h1>

    
      <div className="stats-summary-cards">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-details">
            <h3>Total Files</h3>
            <div className="stat-number">{stats.totalFiles}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-details">
            <h3>Storage Used</h3>
            <div className="stat-number">
              {formatFileSize(stats.totalStorage)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-details">
            <h3>Upload New</h3>
            <button
              onClick={() => navigate("/upload")}
              className="upload-new-btn"
            >
              Upload File
            </button>
          </div>
        </div>
      </div>

      
      <div className="filters-container">
        <div className="filters-row">
          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Size (Largest)</option>
              <option value="type">Document Type</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Classification:</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Levels</option>
              {classifications.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="results-info">
          Showing {files.length} of {totalFiles} files
          {(departmentFilter || classificationFilter) && (
            <span className="active-filters">
              (with filters applied)
            </span>
          )}
        </div>
      </div>

      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="no-files-container">
          <div className="no-files-icon">📁</div>
          <h3>No files found</h3>
          <p>
            {departmentFilter || classificationFilter
              ? "No files match your current filters. Try changing your filters."
              : "You haven't uploaded any files yet."}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="upload-first-btn"
          >
            Upload Your First File
          </button>
        </div>
      ) : (
        <>
          <div className="files-grid">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-header">
                  <div className="file-icon">{getFileIcon(file.filetype)}</div>
                  <div className="file-title">
                    <h3>{file.original_name}</h3>
                    <span className="file-size">
                      {formatFileSize(file.file_size)}
                    </span>
                  </div>
                </div>

                <div className="file-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Type:</span>
                    <span className="metadata-value">
                      {file.document_type || "Not specified"}
                    </span>
                  </div>

                  <div className="metadata-item">
                    <span className="metadata-label">Department:</span>
                    <span className="metadata-value">
                      {file.department || "Not specified"}
                    </span>
                  </div>

                  <div className="metadata-item">
                    <span className="metadata-label">Owner:</span>
                    <span className="metadata-value">
                      {file.owner || "Not specified"}
                    </span>
                  </div>

                  <div className="metadata-item">
                    <span className="metadata-label">Document Date:</span>
                    <span className="metadata-value">
                      {file.document_date
                        ? new Date(file.document_date).toLocaleDateString()
                        : "Not specified"}
                    </span>
                  </div>

                  <div className="metadata-item">
                    <span className="metadata-label">Uploaded:</span>
                    <span className="metadata-value">
                      {formatDate(file.uploaded_at)}
                    </span>
                  </div>

                  {file.description && (
                    <div className="metadata-item full-width">
                      <span className="metadata-label">Description:</span>
                      <p className="file-description">{file.description}</p>
                    </div>
                  )}
                </div>

                <div className="file-classification">
                  <span
                    className={`classification-badge ${getClassificationColor(
                      file.classification_level
                    )}`}
                  >
                    {file.classification_level}
                  </span>
                  <span
                    className={`privacy-badge ${
                      file.is_public
                        ? "public-badge"
                        : "private-badge"
                    }`}
                  >
                    {file.is_public ? "Public" : "Private"}
                  </span>
                </div>

                <div className="file-actions">
                  <button
                    onClick={() =>
                      handleDownload(file.id, file.original_name)
                    }
                    className="action-btn download-btn"
                    title="Download file"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleEdit(file.id)}
                    className="action-btn edit-btn"
                    title="Edit file details"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.original_name)}
                    className="action-btn delete-btn"
                    title="Delete file"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

      
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn prev"
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <div key={page} className="page-number-group">
                      {index > 0 && page - array[index - 1] > 1 && (
                        <span className="page-ellipsis">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`page-number ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-btn next"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyFiles;



*/


/*
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use absolute URL for backend
  const API_BASE = 'https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev';

  useEffect(() => {
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Fetching files...");
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("📡 Using API Base:", API_BASE);
      console.log("🔑 Token exists:", token.substring(0, 20) + "...");
      
      // Use absolute URL with API_BASE
      const response = await fetch(`${API_BASE}/api/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log("✅ Response status:", response.status);
      console.log("✅ Response OK:", response.ok);
      
      // Get response as text first to debug
      const responseText = await response.text();
      console.log("📄 Response text (first 500 chars):", responseText.substring(0, 500));
      
      // Check if it's HTML (error case)
      if (responseText.trim().startsWith('<!DOCTYPE') || 
          responseText.trim().startsWith('<html') ||
          responseText.includes('<!doctype')) {
        console.error("❌ Server returned HTML instead of JSON!");
        console.error("This usually means:");
        console.error("1. Wrong URL (hitting a HTML page)");
        console.error("2. Backend not running on port 3000");
        console.error("3. CORS issue preventing API access");
        throw new Error(`Server returned HTML. Status: ${response.status}. Check if backend is running at ${API_BASE}`);
      }
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", parseError);
        console.error("Response was:", responseText);
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
      }
      
      console.log("📦 Parsed JSON success:", result.success);
      
      if (result.success) {
        setFiles(result.files || []);
        console.log(`✅ Loaded ${result.files?.length || 0} files`);
      } else {
        throw new Error(result.message || "Failed to load files");
      }
    } catch (error) {
      console.error("❌ Error fetching files:", error);
      console.error("❌ Error stack:", error.stack);
      setError(error.message);
      
      // Show more helpful error message
      if (error.message.includes("HTML") || error.message.includes("JSON")) {
        alert(`Backend connection issue. Please check:\n1. Is backend running at ${API_BASE}?\n2. Check browser console for details.`);
      } else {
        alert("Failed to load files: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a test function to check backend connection
  const testBackendConnection = async () => {
    try {
      console.log("🧪 Testing backend connection...");
      
      // Test 1: Health endpoint (no auth)
      const healthResponse = await fetch(`${API_BASE}/health`);
      const healthText = await healthResponse.text();
      console.log("🏥 Health check:", healthText.substring(0, 200));
      
      // Test 2: Root endpoint
      const rootResponse = await fetch(`${API_BASE}/`);
      const rootText = await rootResponse.text();
      console.log("🏠 Root endpoint:", rootText.substring(0, 200));
      
      // Test 3: Check token
      const token = localStorage.getItem("token");
      console.log("🔑 Token present:", !!token);
      if (token) {
        console.log("🔑 Token preview:", token.substring(0, 30) + "...");
      }
      
    } catch (error) {
      console.error("❌ Backend test failed:", error);
      alert(`Cannot connect to backend at ${API_BASE}. Is it running?`);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert("File deleted successfully");
        fetchUserFiles(); // Refresh list
      } else {
        alert(result.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${fileId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📁";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️";
    if (fileType.includes("text")) return "📃";
    return "📁";
  };

  const getClassificationColor = (level) => {
    switch (level) {
      case "Top Secret": return "bg-red-100 text-red-800";
      case "Secret": return "bg-orange-100 text-orange-800";
      case "Confidential": return "bg-yellow-100 text-yellow-800";
      case "Unclassified": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats from files
  const totalStorage = files.reduce((sum, file) => sum + parseInt(file.file_size || 0), 0);
  const uniqueDepartments = [...new Set(files.map(f => f.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="page">
        <h1>My Files</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your files...</p>
          <button 
            onClick={testBackendConnection}
            className="test-btn"
            style={{marginTop: '20px', padding: '8px 16px'}}
          >
            Test Backend Connection
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>My Files</h1>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Files</h3>
          <p>{error}</p>
          <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>
            Backend URL: {API_BASE}
          </p>
          <div style={{marginTop: '20px'}}>
            <button onClick={fetchUserFiles} className="retry-btn">
              Try Again
            </button>
            <button 
              onClick={testBackendConnection}
              className="test-btn"
              style={{marginLeft: '10px'}}
            >
              Test Backend
            </button>
            <button 
              onClick={() => window.open(API_BASE + '/health', '_blank')}
              className="test-btn"
              style={{marginLeft: '10px'}}
            >
              Open Health Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Files</h1>
      
    
      <div style={{
        background: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '20px',
        fontSize: '12px',
        display: 'none' 
      }}>
        <strong>Debug Info:</strong> API Base: {API_BASE} | 
        Files: {files.length} | 
        <button 
          onClick={testBackendConnection}
          style={{marginLeft: '10px', padding: '2px 8px', fontSize: '11px'}}
        >
          Test Connection
        </button>
      </div>

  
      <div className="stats-summary-cards">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-details">
            <h3>Total Files</h3>
            <div className="stat-number">{files.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-details">
            <h3>Storage Used</h3>
            <div className="stat-number">{formatFileSize(totalStorage)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-details">
            <h3>Upload New</h3>
            <button
              onClick={() => navigate("/upload")}
              className="upload-new-btn"
            >
              Upload File
            </button>
          </div>
        </div>
      </div>

      
      <div className="results-info">
        Showing {files.length} file{files.length !== 1 ? 's' : ''}
      </div>

      
      {files.length === 0 ? (
        <div className="no-files-container">
          <div className="no-files-icon">📁</div>
          <h3>No files found</h3>
          <p>You haven't uploaded any files yet.</p>
          <button
            onClick={() => navigate("/upload")}
            className="upload-first-btn"
          >
            Upload Your First File
          </button>
          <button 
            onClick={testBackendConnection}
            className="test-btn"
            style={{marginTop: '10px'}}
          >
            Check Backend Connection
          </button>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-header">
                <div className="file-icon">{getFileIcon(file.filetype)}</div>
                <div className="file-title">
                  <h3>{file.original_name}</h3>
                  <span className="file-size">
                    {formatFileSize(file.file_size)}
                  </span>
                </div>
              </div>

              <div className="file-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">Type:</span>
                  <span className="metadata-value">
                    {file.document_type || "Not specified"}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Department:</span>
                  <span className="metadata-value">
                    {file.department || "Not specified"}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Uploaded:</span>
                  <span className="metadata-value">
                    {formatDate(file.uploaded_at)}
                  </span>
                </div>

                {file.description && (
                  <div className="metadata-item full-width">
                    <span className="metadata-label">Description:</span>
                    <p className="file-description">{file.description}</p>
                  </div>
                )}
              </div>

              <div className="file-classification">
                <span className={`classification-badge ${getClassificationColor(file.classification_level)}`}>
                  {file.classification_level}
                </span>
                <span className={`privacy-badge ${file.is_public ? "public-badge" : "private-badge"}`}>
                  {file.is_public ? "Public" : "Private"}
                </span>
              </div>

              <div className="file-actions">
                <button
                  onClick={() => handleDownload(file.id, file.original_name)}
                  className="action-btn download-btn"
                  title="Download file"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(file.id, file.original_name)}
                  className="action-btn delete-btn"
                  title="Delete file"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFiles;*/



/*

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [sortColumn, setSortColumn] = useState("uploaded_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Extract unique values for filters
  const departments = [...new Set(files.map(f => f.department).filter(Boolean))];
  const documentTypes = [...new Set(files.map(f => f.document_type).filter(Boolean))];
  const classifications = ["Unclassified", "Confidential", "Secret", "Top Secret"];

  const API_BASE = 'https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev';

  useEffect(() => {
    fetchUserFiles();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [files, searchTerm, departmentFilter, typeFilter, classificationFilter, sortColumn, sortDirection]);

  const fetchUserFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE}/api/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();

      if (result.success) {
        setFiles(result.files || []);
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

  const applyFilters = () => {
    let filtered = [...files];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.original_name.toLowerCase().includes(term) ||
        (file.description && file.description.toLowerCase().includes(term)) ||
        (file.owner && file.owner.toLowerCase().includes(term))
      );
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(file => file.department === departmentFilter);
    }

    // Apply document type filter
    if (typeFilter) {
      filtered = filtered.filter(file => file.document_type === typeFilter);
    }

    // Apply classification filter
    if (classificationFilter) {
      filtered = filtered.filter(file => file.classification_level === classificationFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle dates
      if (sortColumn.includes('date') || sortColumn.includes('at')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle file sizes
      if (sortColumn === 'file_size') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredFiles(filtered);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert("File deleted successfully");
        fetchUserFiles(); // Refresh list
      } else {
        alert(result.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${fileId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("word") || fileType.includes("document")) return "📘";
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("text")) return "📃";
    return "📄";
  };

  const getClassificationBadge = (level) => {
    const colors = {
      "Top Secret": "bg-red-100 text-red-800 border border-red-200",
      "Secret": "bg-orange-100 text-orange-800 border border-orange-200",
      "Confidential": "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Unclassified": "bg-green-100 text-green-800 border border-green-200",
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || "bg-gray-100 text-gray-800 border border-gray-200"}`}>
        {level}
      </span>
    );
  };

  const getPrivacyBadge = (isPublic) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPublic ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-800 border border-gray-200"}`}>
        {isPublic ? "Public" : "Private"}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setTypeFilter("");
    setClassificationFilter("");
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="text-2xl font-bold mb-6">My Files</h1>
        <div className="text-center py-10">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="text-2xl font-bold mb-6">My Files</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Files</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUserFiles}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Files</h1>
        <button
          onClick={() => navigate("/upload")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm whitespace-nowrap"
        >
          <span className="mr-2">📤</span>
          Upload New File
        </button>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="text-2xl mr-3 text-blue-600">📁</div>
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-xl font-bold text-gray-800">{files.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="text-2xl mr-3 text-green-600">💾</div>
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-xl font-bold text-gray-800">
                {formatFileSize(files.reduce((sum, file) => sum + parseInt(file.file_size || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="text-2xl mr-3 text-purple-600">🔍</div>
            <div>
              <p className="text-sm text-gray-600">Showing</p>
              <p className="text-xl font-bold text-gray-800">{filteredFiles.length} of {files.length}</p>
            </div>
          </div>
        </div>
      </div>

    
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(searchTerm || departmentFilter || typeFilter || classificationFilter) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">All Types</option>
              {documentTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">All Levels</option>
              {classifications.map((level, index) => (
                <option key={index} value={level}>{level}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortColumn}
              onChange={(e) => setSortColumn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="uploaded_at">Upload Date</option>
              <option value="original_name">File Name</option>
              <option value="file_size">File Size</option>
              <option value="document_type">Document Type</option>
            </select>
          </div>
        </div>
      </div>

    
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-4 text-gray-300">📁</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No files found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || departmentFilter || typeFilter || classificationFilter
                ? "No files match your current filters. Try changing your search criteria."
                : "You haven't uploaded any files yet."}
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("original_name")}
                  >
                    <div className="flex items-center">
                      File Name
                      {sortColumn === "original_name" && (
                        <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort("file_size")}
                  >
                    <div className="flex items-center">
                      Size
                      {sortColumn === "file_size" && (
                        <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("document_type")}
                  >
                    <div className="flex items-center">
                      Type
                      {sortColumn === "document_type" && (
                        <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Classification
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort("uploaded_at")}
                  >
                    <div className="flex items-center">
                      Upload Date
                      {sortColumn === "uploaded_at" && (
                        <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="text-lg mr-3">{getFileIcon(file.filetype)}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={file.original_name}>
                            {file.original_name}
                          </div>
                          <div className="flex items-center mt-1">
                            {getPrivacyBadge(file.is_public)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 whitespace-nowrap">{file.document_type || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {file.department || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getClassificationBadge(file.classification_level)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(file.uploaded_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(file.id, file.original_name)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Download"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.original_name)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    
      <div className="mt-4 text-sm text-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          Showing <span className="font-semibold">{filteredFiles.length}</span> of{" "}
          <span className="font-semibold">{files.length}</span> files
          {(searchTerm || departmentFilter || typeFilter || classificationFilter) && (
            <span className="ml-2 text-blue-600 italic">
              (filtered)
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Click column headers to sort • Click badges for details
        </div>
      </div>

      
      <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 sm:hidden">
        <span className="font-medium">Tip:</span> Scroll horizontally to see all columns on mobile devices.
      </div>
    </div>
  );
};

export default MyFiles;*/






import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ShareModal from '../components/ShareModal.jsx';

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [sortColumn, setSortColumn] = useState("uploaded_at");
  const [sortDirection, setSortDirection] = useState("desc");


// In your state declarations, keep only these:
const [shareMenuOpen, setShareMenuOpen] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);



  // Extract unique values for filters
  const departments = [...new Set(files.map(f => f.department).filter(Boolean))];
  const documentTypes = [...new Set(files.map(f => f.document_type).filter(Boolean))];
  const classifications = ["Unclassified", "Confidential", "Secret", "Top Secret"];

  const API_BASE = 'https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev';

  useEffect(() => {
    fetchUserFiles();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [files, searchTerm, departmentFilter, typeFilter, classificationFilter, sortColumn, sortDirection]);

  const fetchUserFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE}/api/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();

      if (result.success) {
        setFiles(result.files || []);
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

  const applyFilters = () => {
    let filtered = [...files];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.original_name.toLowerCase().includes(term) ||
        (file.description && file.description.toLowerCase().includes(term)) ||
        (file.owner && file.owner.toLowerCase().includes(term))
      );
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(file => file.department === departmentFilter);
    }

    // Apply document type filter
    if (typeFilter) {
      filtered = filtered.filter(file => file.document_type === typeFilter);
    }

    // Apply classification filter
    if (classificationFilter) {
      filtered = filtered.filter(file => file.classification_level === classificationFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle dates
      if (sortColumn.includes('date') || sortColumn.includes('at')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle file sizes
      if (sortColumn === 'file_size') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredFiles(filtered);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };



  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert("File deleted successfully");
        fetchUserFiles(); // Refresh list
      } else {
        alert(result.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file. Please try again.");
    }
  };




  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/upload/${fileId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
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



const handleShareOpen = (file, event) => {
    if (event) {
        event.stopPropagation();
            event.preventDefault();
              }
                setSelectedFile(file);
                  setShareMenuOpen(true);
                  };

                  const handleShareClose = () => {
                    setShareMenuOpen(false);
                      setSelectedFile(null);
                      };







  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("word") || fileType.includes("document")) return "📘";
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("text")) return "📃";
    return "📄";
  };

  const getClassificationBadge = (level) => {
    const colors = {
      "Top Secret": "bg-red-100 text-red-800 border border-red-200",
      "Secret": "bg-orange-100 text-orange-800 border border-orange-200",
      "Confidential": "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Unclassified": "bg-green-100 text-green-800 border border-green-200",
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || "bg-gray-100 text-gray-800 border border-gray-200"}`}>
        {level}
      </span>
    );
  };

  const getPrivacyBadge = (isPublic) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPublic ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-800 border border-gray-200"}`}>
        {isPublic ? "Public" : "Private"}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setTypeFilter("");
    setClassificationFilter("");
  };

  // Add this inline CSS
  const tableStyles = {
    scrollbar: {
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'thin',
      scrollbarColor: '#cbd5e0 #f7fafc',
    },
    scrollbarWebkit: `
      .scrollable-table::-webkit-scrollbar {
        height: 8px;
      }
      .scrollable-table::-webkit-scrollbar-track {
        background: #f7fafc;
        border-radius: 4px;
      }
      .scrollable-table::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 4px;
      }
      .scrollable-table::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }
    `
  };

  if (loading) {
    return (
      <div className="page p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Files</h1>
        <div className="text-center py-10">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Files</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Files</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUserFiles}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page p-4">
      {/* Add inline styles for scrollbar */}
      <style jsx>{`
        .scrollable-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        
        .scrollable-table-container::-webkit-scrollbar {
          height: 8px;
        }
        
        .scrollable-table-container::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 4px;
        }
        
        .scrollable-table-container::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        
        .scrollable-table-container::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        
        .files-table {
          min-width: 900px;
          width: 100%;
        }
        
        .table-wrapper {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Files</h1>
        <button
          onClick={() => navigate("/upload")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm whitespace-nowrap"
        >
          <span className="mr-2">📤</span>
          Upload New File
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="text-2xl mr-3 text-blue-600">📁</div>
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-xl font-bold text-gray-800">{files.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="text-2xl mr-3 text-green-600">💾</div>
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-xl font-bold text-gray-800">
                {formatFileSize(files.reduce((sum, file) => sum + parseInt(file.file_size || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="text-2xl mr-3 text-purple-600">🔍</div>
            <div>
              <p className="text-sm text-gray-600">Showing</p>
              <p className="text-xl font-bold text-gray-800">{filteredFiles.length} of {files.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files by name, description, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(searchTerm || departmentFilter || typeFilter || classificationFilter) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">All Types</option>
              {documentTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">All Levels</option>
              {classifications.map((level, index) => (
                <option key={index} value={level}>{level}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortColumn}
              onChange={(e) => setSortColumn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="uploaded_at">Upload Date</option>
              <option value="original_name">File Name</option>
              <option value="file_size">File Size</option>
              <option value="document_type">Document Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Table - Horizontally Scrollable Container */}
      <div className="table-wrapper">
        {filteredFiles.length === 0 ? (
          <div className="bg-white text-center py-10">
            <div className="text-4xl mb-4 text-gray-300">📁</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No files found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || departmentFilter || typeFilter || classificationFilter
                ? "No files match your current filters. Try changing your search criteria."
                : "You haven't uploaded any files yet."}
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <>
            {/* Scroll Indicator */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">↔️</span>
                <span>Scroll horizontally to view all columns</span>
              </div>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {filteredFiles.length} of {files.length} files
              </span>
            </div>
            
            {/* Scrollable Table Container */}
            <div className="scrollable-table-container">
              <table className="files-table divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      style={{ minWidth: '220px' }}
                      onClick={() => handleSort("original_name")}
                    >
                      <div className="flex items-center">
                        <span className="mr-1">📄</span>
                        File Name
                        {sortColumn === "original_name" && (
                          <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      style={{ minWidth: '100px' }}
                      onClick={() => handleSort("file_size")}
                    >
                      <div className="flex items-center">
                        Size
                        {sortColumn === "file_size" && (
                          <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      style={{ minWidth: '130px' }}
                      onClick={() => handleSort("document_type")}
                    >
                      <div className="flex items-center">
                        Document Type
                        {sortColumn === "document_type" && (
                          <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '120px' }}
                    >
                      Department
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '140px' }}
                    >
                      Classification
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      style={{ minWidth: '120px' }}
                      onClick={() => handleSort("uploaded_at")}
                    >
                      <div className="flex items-center">
                        Upload Date
                        {sortColumn === "uploaded_at" && (
                          <span className="ml-1 text-gray-400">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '100px' }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3" style={{ minWidth: '220px' }}>
                        <div className="flex items-center">
                          <div className="text-lg mr-3">{getFileIcon(file.filetype)}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
                              {file.original_name}
                            </div>
                            <div className="flex items-center mt-1">
                              {getPrivacyBadge(file.is_public)}
                              {file.owner && (
                                <span className="ml-2 text-xs text-gray-500 truncate">by {file.owner}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900" style={{ minWidth: '100px' }}>
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: '130px' }}>
                        <div className="text-sm text-gray-900">{file.document_type || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900" style={{ minWidth: '120px' }}>
                        {file.department || "—"}
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: '140px' }}>
                        {getClassificationBadge(file.classification_level)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900" style={{ minWidth: '120px' }}>
                        {formatDate(file.uploaded_at)}
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: '100px' }}>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleDownload(file.id, file.original_name)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Download"
                          >
                            <span className="text-lg">⬇️</span>
                          </button>

                      <button
                        onClick={(e) => handleShareOpen(file, e)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Share"
                            >
                              <span className="text-lg">🔗</span>
                              </button>
                          <button
                            onClick={() => handleDelete(file.id, file.original_name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <span className="text-lg">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 text-sm text-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center">
          <span className="mr-2">📋</span>
          <span>
            Showing <span className="font-semibold">{filteredFiles.length}</span> of{" "}
            <span className="font-semibold">{files.length}</span> files
          </span>
          {(searchTerm || departmentFilter || typeFilter || classificationFilter) && (
            <span className="ml-2 text-blue-600 italic">
              (filtered)
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <span className="mr-2">💡</span>
          <span>Use the horizontal scrollbar to see all columns</span>
        </div>
      </div>


      {/* Your existing footer... */}

      {/* Share Modal */}
      <ShareModal
        file={selectedFile}
          isOpen={shareMenuOpen}
            onClose={handleShareClose}
            />
      
  
      
    </div>
  );
};

export default MyFiles;








