import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Upload,
  Folder,
  Users,
  FileText,
  Video,
  Image,
  Music,
  Archive,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  Grid,
  List,
  Download,
  Share2,
  Star,
  Trash2
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("my-files");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const sidebarRef = useRef(null);

  // Check if mobile view on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sample files data
  const [files, setFiles] = useState([
    { id: 1, name: "Annual Report 2024.pdf", type: "pdf", size: "2.4 MB", date: "Today", starred: true, shared: false },
    { id: 2, name: "Project Proposal.docx", type: "doc", size: "1.8 MB", date: "Yesterday", starred: false, shared: true },
    { id: 3, name: "Team Meeting.mp4", type: "video", size: "45.2 MB", date: "2 days ago", starred: true, shared: false },
    { id: 4, name: "Company Logo.png", type: "image", size: "3.1 MB", date: "Nov 12", starred: false, shared: false },
  ]);

  // Set active nav based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/upload")) setActiveNav("upload");
    else if (path.includes("/shared")) setActiveNav("shared");
    else setActiveNav("my-files");
  }, [location]);

  // Navigation items
  const navItems = [
    { id: "upload", label: "Upload", icon: <Upload size={20} />, path: "/upload" },
    { id: "my-files", label: "My Files", icon: <Folder size={20} />, path: "/my-files" },
    { id: "shared", label: "Shared", icon: <Users size={20} />, path: "/shared" },
  ];

  const categoryItems = [
    { id: "documents", label: "Documents", icon: <FileText size={20} />, count: 12, color: "#4285F4" },
    { id: "videos", label: "Videos", icon: <Video size={20} />, count: 8, color: "#EA4335" },
    { id: "images", label: "Images", icon: <Image size={20} />, count: 24, color: "#34A853" },
    { id: "audio", label: "Audio", icon: <Music size={20} />, count: 5, color: "#FBBC05" },
    { id: "archives", label: "Archives", icon: <Archive size={20} />, count: 3, color: "#8E44AD" },
  ];

  const userItems = [
    { id: "profile", label: "Profile", icon: <User size={20} />, action: () => navigate("/profile") },
    { id: "settings", label: "Settings", icon: <Settings size={20} />, action: () => navigate("/settings") },
    { id: "logout", label: "Logout", icon: <LogOut size={20} />, action: logout },
  ];

  // Toggle sidebar function
  const toggleSidebar = () => {
    console.log("🍔 Burger menu clicked!");
    console.log("isMobileView:", isMobileView);
    console.log("Current isMobileMenuOpen:", isMobileMenuOpen);
    
    if (isMobileView) {
      // Mobile: toggle the slide-in menu
      setIsMobileMenuOpen(!isMobileMenuOpen);
      console.log("Mobile menu now:", !isMobileMenuOpen);
    } else {
      // Desktop: toggle collapsed/expanded
      setSidebarCollapsed(!sidebarCollapsed);
      console.log("Desktop sidebar now:", !sidebarCollapsed ? "collapsed" : "expanded");
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isMobileMenuOpen && isMobileView) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen, isMobileView]);

  // Get file icon
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

  // Calculate sidebar transform
  const getSidebarTransform = () => {
    if (isMobileView) {
      return isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)";
    }
    return "none";
  };

  // Calculate sidebar width
  const getSidebarWidth = () => {
    if (isMobileView) {
      return "280px"; // Full width on mobile when open
    }
    return sidebarCollapsed ? "64px" : "280px";
  };

  // Calculate main content margin
  const getMainContentMargin = () => {
    if (isMobileView) {
      return "0";
    }
    return sidebarCollapsed ? "64px" : "280px";
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Debug info */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        Mobile: {isMobileView ? 'Yes' : 'No'}<br/>
        Menu Open: {isMobileMenuOpen ? 'Yes' : 'No'}<br/>
        Sidebar Width: {getSidebarWidth()}
      </div>

      {/* Mobile Overlay - Only show when mobile menu is open */}
      {isMobileView && isMobileMenuOpen && (
        <div 
          style={{
            ...styles.mobileOverlay,
            display: isMobileView && isMobileMenuOpen ? 'block' : 'none'
          }}
          onClick={() => {
            console.log("Overlay clicked, closing menu");
            setIsMobileMenuOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        style={{
          ...styles.sidebar,
          width: getSidebarWidth(),
          transform: getSidebarTransform(),
          transition: 'transform 0.3s ease, width 0.3s ease',
          boxShadow: isMobileView && isMobileMenuOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {/* Toggle button - Only show on desktop */}
        {!isMobileView && (
          <button 
            style={styles.sidebarToggle}
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {/* Logo */}
        <div style={{
          ...styles.sidebarLogo,
          padding: sidebarCollapsed && !isMobileView ? '24px 8px' : '24px',
          fontSize: sidebarCollapsed && !isMobileView ? '18px' : '24px',
          textAlign: sidebarCollapsed && !isMobileView ? 'center' : 'left'
        }}>
          {sidebarCollapsed && !isMobileView ? "AD" : "ArchiveDrive"}
        </div>

        {/* Search - Only shown when expanded */}
        {(!sidebarCollapsed || isMobileView) && (
          <div style={styles.sidebarSearch}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search in files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        )}

        {/* Main Navigation */}
        <nav style={styles.sidebarNav}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                setActiveNav(item.id);
                if (isMobileView) {
                  setIsMobileMenuOpen(false);
                }
              }}
              style={{
                ...styles.navItem,
                backgroundColor: activeNav === item.id ? '#e8f0fe' : 'transparent',
                color: activeNav === item.id ? '#4285F4' : '#5f6368',
                fontWeight: activeNav === item.id ? '500' : 'normal',
                justifyContent: (!sidebarCollapsed || isMobileView) ? 'flex-start' : 'center'
              }}
              title={sidebarCollapsed && !isMobileView ? item.label : ""}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {(!sidebarCollapsed || isMobileView) && (
                <span style={styles.navLabel}>{item.label}</span>
              )}
            </a>
          ))}
        </nav>

        {/* Categories - Only show when expanded */}
        {(!sidebarCollapsed || isMobileView) && (
          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Categories</h3>
            <div style={styles.categoriesList}>
              {categoryItems.map((item) => (
                <div key={item.id} style={styles.categoryItem}>
                  <span style={{...styles.categoryIcon, color: item.color}}>
                    {item.icon}
                  </span>
                  <span style={styles.categoryLabel}>{item.label}</span>
                  <span style={styles.categoryCount}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage - Only show when expanded */}
        {(!sidebarCollapsed || isMobileView) && (
          <div style={styles.storageSection}>
            <div style={styles.storageInfo}>
              <div style={styles.storageLabel}>Storage</div>
              <div style={styles.storageValue}>4.7 GB of 15 GB used</div>
            </div>
            <div style={styles.storageBar}>
              <div style={{...styles.storageProgress, width: '31%'}} />
            </div>
          </div>
        )}

        {/* User Section */}
        <div style={styles.userSection}>
          {(!sidebarCollapsed || isMobileView) && (
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {user?.name?.charAt(0) || "U"}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>{user?.name || "User"}</div>
                <div style={styles.userEmail}>{user?.email || "user@example.com"}</div>
              </div>
            </div>
          )}
          
          <div style={styles.userActions}>
            {userItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  if (isMobileView) setIsMobileMenuOpen(false);
                }}
                style={{
                  ...styles.userAction,
                  justifyContent: (!sidebarCollapsed || isMobileView) ? 'flex-start' : 'center',
                  color: item.id === 'logout' ? '#ea4335' : '#5f6368'
                }}
                title={sidebarCollapsed && !isMobileView ? item.label : ""}
              >
                <span style={styles.actionIcon}>{item.icon}</span>
                {(!sidebarCollapsed || isMobileView) && (
                  <span style={styles.actionLabel}>{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        ...styles.mainContent,
        marginLeft: getMainContentMargin(),
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <button 
            style={{
              ...styles.mobileMenuBtn,
              display: isMobileView ? 'block' : 'none'
            }}
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbActive}>My Files</span>
          </div>
          
          <div style={styles.viewControls}>
            <button 
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? '#4285F4' : '#5f6368',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none'
              }}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid size={20} />
            </button>
            <button 
              style={{
                ...styles.viewBtn,
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? '#4285F4' : '#5f6368',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none'
              }}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Files Content */}
        <div style={styles.filesContent}>
          <div style={styles.filesHeader}>
            <h1 style={styles.filesTitle}>My Files</h1>
            <div style={styles.filesStats}>
              <span>{files.length} files • 4.7 GB used</span>
            </div>
          </div>

          {/* Files Grid/List */}
          <div style={{
            ...styles.filesContainer,
            display: viewMode === 'grid' ? 'grid' : 'flex',
            flexDirection: viewMode === 'list' ? 'column' : 'row',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'none'
          }}>
            {files.map((file) => (
              <div key={file.id} style={{
                ...styles.fileItem,
                flexDirection: viewMode === 'grid' ? 'column' : 'row',
                alignItems: viewMode === 'grid' ? 'stretch' : 'center'
              }}>
                <div style={styles.fileIconContainer}>
                  <span style={styles.fileTypeIcon}>{getFileIcon(file.type)}</span>
                  {file.starred && (
                    <span style={styles.fileStar}>
                      <Star size={16} fill="#FFD700" color="#FFD700" />
                    </span>
                  )}
                  {file.shared && (
                    <span style={styles.fileShared}>
                      <Share2 size={16} color="#4285F4" />
                    </span>
                  )}
                </div>
                
                <div style={styles.fileInfo}>
                  <h3 style={styles.fileName}>{file.name}</h3>
                  <div style={{
                    ...styles.fileMeta,
                    display: 'flex',
                    alignItems: 'center',
                    gap: viewMode === 'list' ? '12px' : '8px'
                  }}>
                    <span style={{
                      ...styles.fileType,
                      background: viewMode === 'list' ? 'none' : '#f1f3f4',
                      padding: viewMode === 'list' ? '0' : '2px 6px'
                    }}>
                      {file.type.toUpperCase()}
                    </span>
                    <span style={styles.fileSize}>{file.size}</span>
                    <span style={styles.fileDate}>{file.date}</span>
                  </div>
                </div>
                
                <div style={styles.fileActions}>
                  <button 
                    onClick={() => {/* Handle star */}}
                    style={{
                      ...styles.actionBtn,
                      color: file.starred ? '#FFD700' : '#5f6368'
                    }}
                    title={file.starred ? "Unstar" : "Star"}
                  >
                    <Star size={16} fill={file.starred ? "#FFD700" : "none"} />
                  </button>
                  <button 
                    onClick={() => {/* Handle share */}}
                    style={{
                      ...styles.actionBtn,
                      color: file.shared ? '#4285F4' : '#5f6368'
                    }}
                    title={file.shared ? "Shared" : "Share"}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add some debug CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
};

// Styles remain the same as previous version
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    margin-top:200px;
    backgroundColor: '#f8f9fa',
    position: 'relative'
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'none'
  },
  sidebar: {
    background: 'white',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    overflowY: 'auto',
    zIndex: 1000,
    height: '100vh'
  },
  sidebarToggle: {
    position: 'absolute',
    right: '8px',
    top: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
    zIndex: 10
  },
  sidebarLogo: {
    padding: '24px',
    fontSize: '24px',
    fontWeight: '500',
    color: '#4285F4',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  sidebarSearch: {
    margin: '0 16px 20px',
    padding: '8px 12px',
    background: '#f1f3f4',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#202124'
  },
  sidebarNav: {
    flex: 1,
    padding: '8px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    margin: '4px 0',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    cursor: 'pointer'
  },
  navIcon: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  navLabel: {
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  sidebarSection: {
    padding: '20px 16px 0',
    borderTop: '1px solid #e0e0e0'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#5f6368',
    textTransform: 'uppercase',
    marginBottom: '12px',
    letterSpacing: '0.5px'
  },
  categoriesList: {
    display: 'flex',
    flexDirection: 'column'
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    margin: '4px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  categoryIcon: {
    marginRight: '12px',
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  categoryLabel: {
    flex: 1,
    fontSize: '14px',
    color: '#202124',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  categoryCount: {
    fontSize: '12px',
    color: '#5f6368',
    background: '#f1f3f4',
    padding: '2px 8px',
    borderRadius: '12px',
    minWidth: '24px',
    textAlign: 'center'
  },
  storageSection: {
    padding: '20px 16px',
    borderTop: '1px solid #e0e0e0'
  },
  storageInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  storageLabel: {
    fontSize: '14px',
    color: '#202124',
    fontWeight: '500'
  },
  storageValue: {
    fontSize: '12px',
    color: '#5f6368'
  },
  storageBar: {
    height: '4px',
    background: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  storageProgress: {
    height: '100%',
    background: '#4285F4',
    borderRadius: '2px'
  },
  userSection: {
    padding: '16px',
    borderTop: '1px solid #e0e0e0',
    marginTop: 'auto'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #4285F4, #34A853)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '500',
    fontSize: '18px',
    flexShrink: 0
  },
  userDetails: {
    marginLeft: '12px',
    overflow: 'hidden'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userEmail: {
    fontSize: '12px',
    color: '#5f6368',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  userAction: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
    textAlign: 'left'
  },
  actionIcon: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  actionLabel: {
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  mainContent: {
    flex: 1,
    minHeight: '100vh',
    transition: 'margin-left 0.3s ease'
  },
  topBar: {
    padding: '16px 24px',
    background: 'white',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  mobileMenuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '8px',
    borderRadius: '50%'
  },
  breadcrumb: {
    flex: 1
  },
  breadcrumbActive: {
    fontSize: '14px',
    background: '#e8f0fe',
    color: '#4285F4',
    fontWeight: '500',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  viewControls: {
    display: 'flex',
    gap: '4px',
    background: '#f1f3f4',
    padding: '4px',
    borderRadius: '8px'
  },
  viewBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filesContent: {
    padding: '24px'
  },
  filesHeader: {
    marginBottom: '24px'
  },
  filesTitle: {
    fontSize: '32px',
    fontWeight: '500',
    color: '#202124',
    marginBottom: '8px'
  },
  filesStats: {
    fontSize: '14px',
    color: '#5f6368'
  },
  filesContainer: {
    gap: '16px'
  },
  fileItem: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '16px',
    transition: 'all 0.2s',
    display: 'flex',
    gap: '12px'
  },
  fileIconContainer: {
    position: 'relative',
    width: '48px',
    height: '48px',
    flexShrink: 0
  },
  fileTypeIcon: {
    fontSize: '32px',
    display: 'block',
    textAlign: 'center',
    lineHeight: '48px'
  },
  fileStar: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    background: 'white',
    borderRadius: '50%',
    padding: '2px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileShared: {
    position: 'absolute',
    bottom: '-4px',
    right: '12px',
    background: 'white',
    borderRadius: '50%',
    padding: '2px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileInfo: {
    flex: 1,
    minWidth: 0
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fileMeta: {
    fontSize: '12px',
    color: '#5f6368'
  },
  fileType: {
    borderRadius: '4px',
    whiteSpace: 'nowrap'
  },
  fileSize: {},
  fileDate: {},
  fileActions: {
    display: 'flex',
    gap: '4px',
    opacity: 0,
    transition: 'opacity 0.2s',
    flexShrink: 0
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default Dashboard;