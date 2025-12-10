import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ShareModal from '../components/ShareModal.jsx';
import { Grid, List, Star, Share2, Download, Trash2, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

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
  
  // View mode
  const [viewMode, setViewMode] = useState("grid");
  
  // Share modal
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE = 'http://localhost:3000';

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
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
    return "📄";
  };

  const getClassificationBadge = (level) => {
    const colors = {
      "Top Secret": "#dc2626",
      "Secret": "#ea580c",
      "Confidential": "#ca8a04",
      "Unclassified": "#16a34a",
    };
    
    return (
      <span style={{
        ...styles.classificationBadge,
        backgroundColor: `${colors[level]}20`,
        color: colors[level] || "#6b7280",
        borderColor: `${colors[level]}40`
      }}>
        {level}
      </span>
    );
  };

  const getPrivacyBadge = (isPublic) => {
    return (
      <span style={isPublic ? styles.publicBadge : styles.privateBadge}>
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

  // Extract unique values for filters
  const departments = [...new Set(files.map(f => f.department).filter(Boolean))];
  const documentTypes = [...new Set(files.map(f => f.document_type).filter(Boolean))];
  const classifications = ["Unclassified", "Confidential", "Secret", "Top Secret"];

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
          onClick={fetchUserFiles}
          style={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>My Files</h1>
          <p style={styles.subtitle}>
            {filteredFiles.length} of {files.length} files • {formatFileSize(files.reduce((sum, file) => sum + parseInt(file.file_size || 0), 0))} used
          </p>
        </div>
        <div style={styles.headerRight}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Filter size={16} />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div style={styles.viewControls}>
            <button 
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? '#4285F4' : '#5f6368',
              }}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid size={20} />
            </button>
            <button 
              style={{
                ...styles.viewButton,
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? '#4285F4' : '#5f6368',
              }}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={20} />
            </button>
          </div>
          <button
            onClick={() => navigate("/upload")}
            style={styles.uploadButton}
          >
            📤 Upload New File
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <Search size={18} color="#5f6368" />
          <input
            type="text"
            placeholder="Search files by name, description, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={styles.filtersPanel}>
          <div style={styles.filterGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={styles.selectInput}
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Document Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={styles.selectInput}
              >
                <option value="">All Types</option>
                {documentTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Classification</label>
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                style={styles.selectInput}
              >
                <option value="">All Levels</option>
                {classifications.map((level, index) => (
                  <option key={index} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select
                value={sortColumn}
                onChange={(e) => setSortColumn(e.target.value)}
                style={styles.selectInput}
              >
                <option value="uploaded_at">Upload Date</option>
                <option value="original_name">File Name</option>
                <option value="file_size">File Size</option>
                <option value="document_type">Document Type</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || departmentFilter || typeFilter || classificationFilter) && (
            <div style={styles.filterActions}>
              <button
                onClick={clearFilters}
                style={styles.clearFiltersButton}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <h3 style={styles.emptyTitle}>No files found</h3>
          <p style={styles.emptyMessage}>
            {searchTerm || departmentFilter || typeFilter || classificationFilter
              ? "No files match your current filters. Try changing your search criteria."
              : "You haven't uploaded any files yet."}
          </p>
          <button
            onClick={() => navigate("/upload")}
            style={styles.uploadButton}
          >
            Upload Your First File
          </button>
        </div>
      ) : (
        <div style={{
          ...styles.filesContainer,
          display: viewMode === 'grid' ? 'grid' : 'flex',
          flexDirection: viewMode === 'list' ? 'column' : 'row',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none'
        }}>
          {filteredFiles.map((file) => (
            <div key={file.id} style={{
              ...styles.fileItem,
              flexDirection: viewMode === 'grid' ? 'column' : 'row',
              alignItems: viewMode === 'grid' ? 'stretch' : 'center'
            }}>
              <div style={styles.fileIconContainer}>
                <span style={styles.fileTypeIcon}>{getFileIcon(file.filetype)}</span>
                <div style={styles.fileBadges}>
                  {getPrivacyBadge(file.is_public)}
                  {getClassificationBadge(file.classification_level)}
                </div>
              </div>
              
              <div style={styles.fileInfo}>
                <h3 style={styles.fileName} title={file.original_name}>
                  {file.original_name}
                </h3>
                <p style={styles.fileDescription}>
                  {file.description || "No description"}
                </p>
                <div style={{
                  ...styles.fileMeta,
                  display: 'flex',
                  alignItems: 'center',
                  gap: viewMode === 'list' ? '16px' : '12px'
                }}>
                  <span style={styles.fileSize}>
                    {formatFileSize(file.file_size)}
                  </span>
                  <span style={styles.fileType}>
                    {file.document_type || "Document"}
                  </span>
                  <span style={styles.fileDate}>
                    {formatDate(file.uploaded_at)}
                  </span>
                </div>
                {file.owner && (
                  <div style={styles.fileOwner}>
                    Uploaded by {file.owner}
                    {file.department && (
                      <span style={styles.fileDepartment}> • {file.department}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div style={styles.fileActions}>
                <button 
                  onClick={() => handleDownload(file.id, file.original_name)}
                  style={styles.actionButton}
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={(e) => handleShareOpen(file, e)}
                  style={styles.actionButton}
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(file.id, file.original_name)}
                  style={{...styles.actionButton, color: '#ea4335'}}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          <span style={styles.footerText}>
            Showing {filteredFiles.length} of {files.length} files
            {(searchTerm || departmentFilter || typeFilter || classificationFilter) && (
              <span style={styles.filteredIndicator}> (filtered)</span>
            )}
          </span>
        </div>
        <div style={styles.footerRight}>
          <span style={styles.footerHint}>
            {viewMode === 'grid' ? 'Grid' : 'List'} view • Click icons to interact with files
          </span>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        file={selectedFile}
        isOpen={shareMenuOpen}
        onClose={handleShareClose}
      />
    </div>
  );
};

// Styles
const styles = {
  pageContainer: {
    flex: 1,
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
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
    margin: 0,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#5f6368',
    margin: 0,
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    color: '#5f6368',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewControls: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#f8f9fa',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #dadce0',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '6px',
    background: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  uploadButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  searchSection: {
    marginBottom: '20px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '12px 16px',
    border: '1px solid #dadce0',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    marginLeft: '12px',
    fontSize: '14px',
    color: '#202124',
    outline: 'none',
  },
  filtersPanel: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#5f6368',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  selectInput: {
    padding: '10px 12px',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#202124',
    backgroundColor: 'white',
    outline: 'none',
    cursor: 'pointer',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
  },
  clearFiltersButton: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    color: '#5f6368',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filesContainer: {
    gap: '16px',
  },
  fileItem: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: viewMode === 'grid' ? '20px' : '16px',
    transition: 'all 0.2s',
    display: 'flex',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderColor: '#4285F4',
      transform: 'translateY(-2px)',
    },
  },
  fileIconContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: viewMode === 'grid' ? '0' : '16px',
    marginBottom: viewMode === 'grid' ? '16px' : '0',
  },
  fileTypeIcon: {
    fontSize: '48px',
    marginBottom: viewMode === 'grid' ? '12px' : '8px',
  },
  fileBadges: {
    display: 'flex',
    flexDirection: viewMode === 'grid' ? 'row' : 'column',
    gap: '6px',
    width: '100%',
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: viewMode === 'grid' ? 'wrap' : 'nowrap',
  },
  fileDescription: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0 0 12px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: viewMode === 'grid' ? 2 : 1,
    WebkitBoxOrient: 'vertical',
  },
  fileMeta: {
    fontSize: '12px',
    color: '#5f6368',
    marginBottom: '8px',
  },
  fileSize: {
    backgroundColor: '#f1f3f4',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  fileType: {
    backgroundColor: '#e8f0fe',
    color: '#4285F4',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  fileDate: {
    backgroundColor: '#f1f3f4',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  fileOwner: {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '8px',
  },
  fileDepartment: {
    fontWeight: '500',
    color: '#4285F4',
  },
  fileActions: {
    display: 'flex',
    flexDirection: viewMode === 'grid' ? 'row' : 'column',
    gap: '8px',
    marginLeft: viewMode === 'grid' ? '0' : '16px',
    justifyContent: viewMode === 'grid' ? 'center' : 'flex-start',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#5f6368',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      borderColor: '#4285F4',
      color: '#4285F4',
    },
  },
  classificationBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'inline-block',
    textAlign: 'center',
  },
  publicBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#e8f0fe',
    color: '#4285F4',
    border: '1px solid #4285F4',
    display: 'inline-block',
    textAlign: 'center',
  },
  privateBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#f1f3f4',
    color: '#5f6368',
    border: '1px solid #dadce0',
    display: 'inline-block',
    textAlign: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    color: '#dadce0',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  emptyMessage: {
    fontSize: '14px',
    color: '#5f6368',
    maxWidth: '400px',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    padding: '16px 0',
    borderTop: '1px solid #e0e0e0',
  },
  footerText: {
    fontSize: '14px',
    color: '#5f6368',
  },
  filteredIndicator: {
    color: '#4285F4',
    fontStyle: 'italic',
  },
  footerHint: {
    fontSize: '12px',
    color: '#9aa0a6',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #4285F4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#5f6368',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#dc2626',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#991b1b',
    margin: '0 0 8px 0',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#b91c1c',
    margin: '0 0 20px 0',
    maxWidth: '400px',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default MyFiles;