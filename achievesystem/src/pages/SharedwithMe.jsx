import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const SharedWithMe = () => {
  const { user } = useContext(AuthContext);
  const [publicFiles, setPublicFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [filterOwner, setFilterOwner] = useState("");
  const [fileOwners, setFileOwners] = useState([]);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const API_BASE = 'https://archivesystembackend.onrender.com';

  useEffect(() => {
    if (user) {
      fetchPublicFiles();
    }
  }, [user, currentPage, search, filterOwner]);

  useEffect(() => {
    const owners = [...new Set(publicFiles.map(file => 
      file.owner_name || file.owner || file.user_name || 'Unknown'
    ))].filter(Boolean);
    setFileOwners(owners);
  }, [publicFiles]);

  const fetchPublicFiles = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please log in to view shared files');
      }

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      if (search) params.append('search', search);
      if (filterOwner) params.append('owner', filterOwner);
      
      const url = `${API_BASE}/api/upload/public?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Please log in again');
      } else if (!response.ok) {
        throw new Error(`Failed to load files: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPublicFiles(result.data?.files || []);
        setTotalPages(result.data?.pagination?.totalPages || 1);
        setTotalFiles(result.data?.pagination?.totalFiles || 0);
      } else {
        throw new Error(result.message || 'Failed to load shared files');
      }

    } catch (error) {
      console.error("Error loading shared files:", error);
      setError(error.message);
      setPublicFiles([]);
      setTotalPages(1);
      setTotalFiles(0);
    } finally {
      setLoading(false);
    }
  };

  const makeFilePrivate = async (fileId) => {
    if (!window.confirm('Are you sure you want to make this file private?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/upload/${fileId}/visibility`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_public: false })
      });

      if (!response.ok) {
        throw new Error('Failed to update file');
      }

      const result = await response.json();
      
      if (result.success) {
        alert('✓ File is now private');
        fetchPublicFiles();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed: ${error.message}`);
    }
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/upload/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  const getFileIcon = (file) => {
    const fileType = (file.file_type || file.filetype || '').toLowerCase();
    const fileName = (file.original_name || '').toLowerCase();
    
    if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName)) return "🖼️";
    if (fileType.includes('pdf') || fileName.includes('.pdf')) return "📄";
    if (fileType.includes('word') || fileType.includes('document') || /\.(doc|docx)$/i.test(fileName)) return "📝";
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || /\.(xls|xlsx|csv)$/i.test(fileName)) return "📊";
    if (fileType.includes('video') || /\.(mp4|mov|avi|mkv)$/i.test(fileName)) return "🎬";
    if (fileType.includes('audio') || /\.(mp3|wav|aac)$/i.test(fileName)) return "🎵";
    if (fileType.includes('archive') || fileType.includes('compressed') || /\.(zip|rar|7z)$/i.test(fileName)) return "📦";
    return "📎";
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

  const isFileOwner = (file) => {
    const fileUserId = file.user_id || file.userId;
    const currentUserId = user?.id || user?.userId;
    return fileUserId === currentUserId;
  };

  // Calculate total storage used by shared files
  const totalStorageUsed = publicFiles.reduce((sum, file) => sum + parseInt(file.file_size || 0), 0);
  const formatTotalStorage = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter files based on search
  const filteredFiles = publicFiles.filter(file => 
    (file.original_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (file.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (file.owner_name || file.owner || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading shared files...</p>
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
          onClick={fetchPublicFiles}
          style={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Shared With Me</h1>
          <div style={styles.filesStats}>
            <span>{publicFiles.length} shared files • {formatTotalStorage(totalStorageUsed)} total</span>
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
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search shared files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterContainer}>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Owners</option>
            {fileOwners.map((owner, index) => (
              <option key={index} value={owner}>{owner}</option>
            ))}
          </select>
          
          {(search || filterOwner) && (
            <button
              onClick={() => { setSearch(''); setFilterOwner(''); }}
              style={styles.clearFilterButton}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Files Grid/List */}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
        overflowX: viewMode === 'list' ? 'hidden' : 'visible'
      }}>
        {publicFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>📂</span>
            <h3 style={styles.emptyTitle}>
              No shared files available
            </h3>
            <p style={styles.emptyText}>
              {search || filterOwner 
                ? "No files match your filters." 
                : "No users have shared files publicly yet."}
            </p>
          </div>
        ) : (
          publicFiles.map((file) => (
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
                marginRight: viewMode === 'grid' ? '0' : '16px',
                marginBottom: viewMode === 'grid' ? '12px' : '0',
              }}>
                <span style={styles.fileTypeIcon}>{getFileIcon(file)}</span>
                <span style={styles.fileShared}>
                  🔗
                </span>
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
                  {file.original_name || file.filename || 'Unknown File'}
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
                    {file.file_type?.toUpperCase() || 'FILE'}
                  </span>
                  <span style={styles.fileSize}>{formatFileSize(file.file_size)}</span>
                  <span style={styles.fileDate}>
                    {formatDate(file.public_since || file.created_at || file.uploaded_at)}
                  </span>
                </div>
                
                {/* File details */}
                <div style={styles.fileDetails}>
                  <span style={styles.fileOwner}>
                    By: {file.owner_name || file.owner || 'Unknown'}
                  </span>
                  {file.owner_email && file.owner_email !== 'No email available' && (
                    <span style={styles.fileEmail}>
                      • {file.owner_email}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {file.description && (
                  <div style={{
                    ...styles.fileDescription,
                    display: viewMode === 'grid' ? 'none' : 'block'
                  }}>
                    {file.description}
                  </div>
                )}
              </div>
              
              <div style={{
                ...styles.fileActions,
                flexDirection: viewMode === 'grid' ? 'row' : 'row',
                gap: viewMode === 'grid' ? '6px' : '8px',
                marginTop: viewMode === 'grid' ? 'auto' : '0',
                marginLeft: viewMode === 'list' ? '12px' : '0'
              }}>
                <button 
                  onClick={() => downloadFile(file.id, file.original_name || file.filename)}
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
                
                {isFileOwner(file) && (
                  <button 
                    onClick={() => makeFilePrivate(file.id)}
                    style={{
                      ...styles.actionBtn,
                      color: '#ea4335',
                      width: viewMode === 'grid' ? '32px' : '36px',
                      height: viewMode === 'grid' ? '32px' : '36px',
                      fontSize: viewMode === 'grid' ? '14px' : '16px'
                    }}
                    title="Make Private"
                  >
                    🔒
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination and Footer */}
      <div style={styles.footer}>
        <div style={styles.footerStats}>
          Showing {publicFiles.length} of {totalFiles} shared files
          {search && (
            <span style={styles.filteredText}> • Filtered</span>
          )}
        </div>
        
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={styles.paginationButton}
            >
              ← Previous
            </button>
            
            <span style={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={styles.paginationButton}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    flex: 1,
    padding: '20px',
    overflowX: 'hidden',
    maxWidth: '100%',
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 200px)',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeftColor: '#4285F4',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#5f6368',
    fontSize: '14px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 200px)',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorTitle: {
    margin: '0 0 8px 0',
    color: '#202124',
  },
  errorMessage: {
    color: '#5f6368',
    marginBottom: '24px',
    maxWidth: '400px',
  },
  retryButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
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
    backgroundColor: '#f8f9fa',
    padding: '4px',
    borderRadius: '8px',
  },
  viewBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  searchSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  searchContainer: {
    flex: 1,
    minWidth: '200px',
    position: 'relative',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#5f6368',
    fontSize: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  filterContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  filterSelect: {
    padding: '10px 12px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    minWidth: '150px',
  },
  clearFilterButton: {
    padding: '10px 16px',
    backgroundColor: '#f1f3f4',
    color: '#202124',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  filesContainer: {
    gap: '16px',
    marginBottom: '20px',
  },
  fileItem: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'all 0.2s',
    display: 'flex',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    },
  },
  fileIconContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  fileTypeIcon: {
    fontSize: '32px',
    display: 'block',
  },
  fileShared: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    fontSize: '12px',
    backgroundColor: '#4285F4',
    color: 'white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    margin: '0 0 6px 0',
  },
  fileMeta: {
    fontSize: '12px',
    color: '#5f6368',
    marginBottom: '4px',
  },
  fileTypeBadge: {
    fontSize: '11px',
    color: '#5f6368',
    borderRadius: '4px',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: '12px',
  },
  fileDate: {
    fontSize: '12px',
  },
  fileDetails: {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '2px',
  },
  fileOwner: {
    fontWeight: '500',
  },
  fileEmail: {
    fontSize: '11px',
    color: '#80868b',
  },
  fileDescription: {
    fontSize: '12px',
    color: '#5f6368',
    marginTop: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  fileActions: {
    display: 'flex',
    alignItems: 'center',
  },
  actionBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    color: '#5f6368',
    '&:hover': {
      backgroundColor: '#f1f3f4',
    },
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#202124',
    margin: '16px 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#5f6368',
    marginBottom: '24px',
    maxWidth: '300px',
    margin: '0 auto 24px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
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
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    '&:disabled': {
      backgroundColor: '#f1f3f4',
      color: '#9aa0a6',
      cursor: 'not-allowed',
    },
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#5f6368',
    fontWeight: '500',
  },
};

export default SharedWithMe;