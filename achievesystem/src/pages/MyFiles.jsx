import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ShareModal from '../components/ShareModal.jsx';

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Demo files data
  const demoFiles = [
    { id: 1, name: "Annual Report 2024.pdf", type: "pdf", size: "2.4 MB", date: "Today", starred: true, shared: false },
    { id: 2, name: "Project Proposal.docx", type: "doc", size: "1.8 MB", date: "Yesterday", starred: false, shared: true },
    { id: 3, name: "Team Meeting.mp4", type: "video", size: "45.2 MB", date: "2 days ago", starred: true, shared: false },
    { id: 4, name: "Company Logo.png", type: "image", size: "3.1 MB", date: "Nov 12", starred: false, shared: false },
    { id: 5, name: "Financial Data.xlsx", type: "spreadsheet", size: "5.7 MB", date: "Nov 10", starred: false, shared: true },
    { id: 6, name: "Design Assets.zip", type: "archive", size: "125.4 MB", date: "Nov 5", starred: true, shared: false },
  ];

  useEffect(() => {
    // Use demo data for now
    setFiles(demoFiles);
    setLoading(false);
  }, []);

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    setFiles(files.filter(f => f.id !== fileId));
    alert("File deleted successfully");
  };

  const handleDownload = (fileId, fileName) => {
    alert(`Downloading ${fileName}`);
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
    };
    return icons[type] || "📎";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your files...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>My Files</h1>
          <div style={styles.filesStats}>
            <span>{files.length} files • 4.7 GB used</span>
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
            onClick={() => navigate("/upload")}
            style={styles.uploadButton}
          >
            <span style={{ marginRight: '8px' }}>📤</span>
            Upload New File
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Files Grid/List */}
      <div style={{
        ...styles.filesContainer,
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : 'none',
        overflowX: viewMode === 'list' ? 'hidden' : 'visible'
      }}>
        {filteredFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>📁</span>
            <h3 style={styles.emptyTitle}>No files found</h3>
            <p style={styles.emptyText}>
              {searchTerm ? "No files match your search." : "You haven't uploaded any files yet."}
            </p>
            <button
              onClick={() => navigate("/upload")}
              style={styles.uploadButton}
            >
              Upload Your First File
            </button>
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
                marginRight: viewMode === 'grid' ? '0' : '16px',
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
                  onClick={() => handleDownload(file.id, file.name)}
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerStats}>
          Showing {filteredFiles.length} of {files.length} files
          {searchTerm && (
            <span style={styles.filteredText}> • Filtered</span>
          )}
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
    padding: '20px',
    overflowX: 'hidden',
    maxWidth: '100%',
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
    border: '1px solid #dadce0',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    background: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  },
  uploadButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  searchSection: {
    marginBottom: '20px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: '8px',
    padding: '10px 16px',
  },
  searchIcon: {
    marginRight: '10px',
    fontSize: '16px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: '#202124',
    outline: 'none',
    minWidth: 0,
  },
  filesContainer: {
    gap: '12px',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  fileItem: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    display: 'flex',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderColor: '#4285F4',
    },
  },
  fileIconContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  fileTypeIcon: {
    fontSize: '32px',
  },
  fileStar: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    fontSize: '12px',
    color: '#FFD700',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '1px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  fileShared: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    fontSize: '10px',
    color: '#4285F4',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: '1px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  fileInfo: {
    minWidth: 0,
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  fileMeta: {
    marginBottom: '4px',
  },
  fileTypeBadge: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#4285F4',
    borderRadius: '10px',
  },
  fileSize: {
    fontSize: '12px',
    color: '#5f6368',
  },
  fileDate: {
    fontSize: '12px',
    color: '#5f6368',
  },
  fileActions: {
    display: 'flex',
    flexShrink: 0,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#5f6368',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      borderColor: '#4285F4',
      color: '#4285F4',
    },
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: 'white',
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    textAlign: 'center',
    gridColumn: '1 / -1',
    marginTop: '20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    margin: '16px 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0 0 20px 0',
    maxWidth: '300px',
  },
  footer: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  footerStats: {
    fontSize: '14px',
    color: '#5f6368',
    textAlign: 'center',
  },
  filteredText: {
    color: '#4285F4',
    fontStyle: 'italic',
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