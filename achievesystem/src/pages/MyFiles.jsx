
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



