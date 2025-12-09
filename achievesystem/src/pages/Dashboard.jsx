/*const Dashboard = () => {

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Your documents, uploads, and activity overview.</p>
    </div>
  );
};

export default Dashboard;*/

/*
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page">
      <h1>Welcome {user?.name}</h1>
      
      <div className="profile-info">
        <h2>Your Profile</h2>

      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        
        {user?.role === "admin" ? (
          // Admin Dashboard
          <div className="admin-actions">
            <h3>Administrator Tools</h3>
            <button onClick={() => navigate("/upload")}>Upload Files</button>
            <button onClick={() => navigate("/manage-users")}>Manage Users</button>
            <button onClick={() => navigate("/manage-files")}>View All Files</button>
            <button onClick={() => navigate("/system-reports")}>System Reports</button>
            <button onClick={() => navigate ("/my-files")}>MyFiles</button>
            <button onClick={() => navigate("/system-settings")}>System Settings</button>
          </div>
        ) : (
          // User Dashboard
          <div className="user-actions">
            <h3>Your Files</h3>
            <button onClick={() => navigate("/upload")}>Upload New File</button>
            <button onClick={() => navigate("/my-files")}> My Files</button>
            <button onClick={() => navigate("/shared-files")}>Shared With Me</button>
            <button onClick={() => navigate("/profile")}>Edit Profile</button>
            <button onClick={() => navigate("/settings")}>Account Settings</button>
          </div>
        )}

        <div className="general-actions">
          <h3>General</h3>
          <button onClick={() => navigate("/help")}>Help & Support</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;*/






import { useState, useEffect, useContext, useRef } from "react";
import "./Dashboard.css";
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
  MoreVertical,
  Star,
  Trash2
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("my-files");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef(null);
  
  // Sample files data
  const [files, setFiles] = useState([
    { id: 1, name: "Annual Report 2024.pdf", type: "pdf", size: "2.4 MB", date: "Today", starred: true, shared: false },
    { id: 2, name: "Project Proposal.docx", type: "doc", size: "1.8 MB", date: "Yesterday", starred: false, shared: true },
    { id: 3, name: "Team Meeting.mp4", type: "video", size: "45.2 MB", date: "2 days ago", starred: true, shared: false },
    { id: 4, name: "Company Logo.png", type: "image", size: "3.1 MB", date: "Nov 12", starred: false, shared: false },
    { id: 5, name: "Budget Spreadsheet.xlsx", type: "spreadsheet", size: "4.7 MB", date: "Nov 10", starred: true, shared: true },
    { id: 6, name: "Marketing Plan.pdf", type: "pdf", size: "5.3 MB", date: "Nov 8", starred: false, shared: false },
    { id: 7, name: "Product Photos.zip", type: "archive", size: "12.8 MB", date: "Nov 5", starred: false, shared: true },
    { id: 8, name: "Presentation Slides.pptx", type: "presentation", size: "8.9 MB", date: "Nov 3", starred: true, shared: false },
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
    { id: "storage", label: "Storage", value: "4.7 GB / 15 GB", percent: 31 },
    { id: "profile", label: "Profile", icon: <User size={20} />, action: () => navigate("/profile") },
    { id: "settings", label: "Settings", icon: <Settings size={20} />, action: () => navigate("/settings") },
    { id: "logout", label: "Logout", icon: <LogOut size={20} />, action: logout },
  ];

  // File actions
  const handleFileAction = (fileId, action) => {
    switch(action) {
      case "star":
        setFiles(files.map(f => f.id === fileId ? { ...f, starred: !f.starred } : f));
        break;
      case "share":
        setFiles(files.map(f => f.id === fileId ? { ...f, shared: !f.shared } : f));
        break;
      case "download":
        console.log(`Downloading file ${fileId}`);
        break;
      case "delete":
        setFiles(files.filter(f => f.id !== fileId));
        break;
    }
  };

  // Get file icon
  const getFileIcon = (type) => {
    const icons = {
      pdf: "📄",
      doc: "📝",
      video: "🎬",
      image: "🖼️",
      spreadsheet: "📊",
      archive: "📦",
      presentation: "📽️"
    };
    return icons[type] || "📎";
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      >
        {/* Toggle button */}
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          {sidebarCollapsed ? "AD" : "ArchiveDrive"}
        </div>

        {/* Search - Only shown when expanded */}
        {!sidebarCollapsed && (
          <div className="sidebar-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search in files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                setActiveNav(item.id);
              }}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Categories */}
        {!sidebarCollapsed && (
          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="categories">
              {categoryItems.map((item) => (
                <div key={item.id} className="category-item">
                  <span className="category-icon" style={{ color: item.color }}>
                    {item.icon}
                  </span>
                  <span className="category-label">{item.label}</span>
                  <span className="category-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage */}
        {!sidebarCollapsed && (
          <div className="storage-section">
            <div className="storage-info">
              <div className="storage-label">Storage</div>
              <div className="storage-value">4.7 GB of 15 GB used</div>
            </div>
            <div className="storage-bar">
              <div 
                className="storage-progress" 
                style={{ width: '31%' }}
              ></div>
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="user-section">
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name || "User"}</div>
                <div className="user-email">{user?.email || "user@example.com"}</div>
              </div>
            </div>
          )}
          
          <div className="user-actions">
            {userItems.slice(1).map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="user-action"
                title={sidebarCollapsed ? item.label : ""}
              >
                <span className="action-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="action-label">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Top Bar */}
        <div className="top-bar">
          <button 
            className="mobile-menu"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu size={24} />
          </button>
          
          <div className="breadcrumb">
            <span className="breadcrumb-item active">My Files</span>
          </div>
          
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Grid size={20} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Files Content */}
        <div className="files-content">
          <div className="files-header">
            <h1>My Files</h1>
            <div className="files-stats">
              <span>{files.length} files • 4.7 GB used</span>
            </div>
          </div>

          {/* Files Grid/List */}
          <div className={`files-container ${viewMode}`}>
            {files.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-icon">
                  <span className="file-type-icon">{getFileIcon(file.type)}</span>
                  {file.starred && (
                    <span className="file-star">
                      <Star size={16} fill="#FFD700" color="#FFD700" />
                    </span>
                  )}
                  {file.shared && (
                    <span className="file-shared">
                      <Share2 size={16} color="#4285F4" />
                    </span>
                  )}
                </div>
                
                <div className="file-info">
                  <h3 className="file-name">{file.name}</h3>
                  <div className="file-meta">
                    <span className="file-type">{file.type.toUpperCase()}</span>
                    <span className="file-size">{file.size}</span>
                    <span className="file-date">{file.date}</span>
                  </div>
                </div>
                
                <div className="file-actions">
                  <button 
                    onClick={() => handleFileAction(file.id, 'star')}
                    className={`action-btn ${file.starred ? 'starred' : ''}`}
                    title={file.starred ? "Unstar" : "Star"}
                  >
                    <Star size={16} fill={file.starred ? "#FFD700" : "none"} />
                  </button>
                  <button 
                    onClick={() => handleFileAction(file.id, 'share')}
                    className={`action-btn ${file.shared ? 'shared' : ''}`}
                    title={file.shared ? "Shared" : "Share"}
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleFileAction(file.id, 'download')}
                    className="action-btn"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => handleFileAction(file.id, 'delete')}
                    className="action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          margin-top:200px;
          background-color: #f8f9fa;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar.collapsed {
          width: 64px;
        }

        .sidebar-toggle {
          position: absolute;
          right: 8px;
          top: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: #5f6368;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s;
          z-index: 10;
        }

        .sidebar-toggle:hover {
          background-color: #f1f3f4;
        }

        .sidebar-logo {
          padding: 20px 24px;
          font-size: 24px;
          font-weight: 500;
          color: #4285F4;
          white-space: nowrap;
          overflow: hidden;
        }

        .sidebar.collapsed .sidebar-logo {
          font-size: 18px;
          text-align: center;
          padding: 20px 0;
        }

        .sidebar-search {
          margin: 0 16px 20px;
          padding: 8px 12px;
          background: #f1f3f4;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin: 4px 0;
          border-radius: 8px;
          color: #5f6368;
          text-decoration: none;
          transition: background-color 0.2s;
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-item:hover {
          background-color: #f1f3f4;
        }

        .nav-item.active {
          background-color: #e8f0fe;
          color: #4285F4;
          font-weight: 500;
        }

        .nav-icon {
          margin-right: 12px;
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 14px;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 16px 0;
        }

        .sidebar.collapsed .nav-icon {
          margin-right: 0;
        }

        /* Categories */
        .sidebar-section {
          padding: 20px 16px 0;
          border-top: 1px solid #e0e0e0;
        }

        .sidebar-section h3 {
          font-size: 12px;
          font-weight: 500;
          color: #5f6368;
          text-transform: uppercase;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        .category-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          margin: 4px 0;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .category-item:hover {
          background-color: #f1f3f4;
        }

        .category-icon {
          margin-right: 12px;
          width: 20px;
        }

        .category-label {
          flex: 1;
          font-size: 14px;
          color: #202124;
        }

        .category-count {
          font-size: 12px;
          color: #5f6368;
          background: #f1f3f4;
          padding: 2px 8px;
          border-radius: 12px;
          min-width: 24px;
          text-align: center;
        }

        /* Storage Section */
        .storage-section {
          padding: 20px 16px;
          border-top: 1px solid #e0e0e0;
        }

        .storage-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .storage-label {
          font-size: 14px;
          color: #202124;
          font-weight: 500;
        }

        .storage-value {
          font-size: 12px;
          color: #5f6368;
        }

        .storage-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }

        .storage-progress {
          height: 100%;
          background: #4285F4;
          border-radius: 2px;
          transition: width 0.3s;
        }

        /* User Section */
        .user-section {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .user-info {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #4285F4, #34A853);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          font-size: 18px;
          flex-shrink: 0;
        }

        .user-details {
          margin-left: 12px;
          overflow: hidden;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #202124;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 12px;
          color: #5f6368;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-action {
          display: flex;
          align-items: center;
          padding: 12px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #5f6368;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
        }

        .user-action:hover {
          background-color: #f1f3f4;
        }

        .action-icon {
          margin-right: 12px;
        }

        .action-label {
          font-size: 14px;
        }

        .sidebar.collapsed .user-action {
          justify-content: center;
          padding: 16px 0;
        }

        .sidebar.collapsed .action-icon {
          margin-right: 0;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          min-height: 100vh;
          padding-left: 0;
          transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-content.collapsed {
          padding-left: 64px;
        }

        .top-bar {
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mobile-menu {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #5f6368;
          padding: 8px;
          border-radius: 50%;
        }

        .breadcrumb {
          flex: 1;
        }

        .breadcrumb-item {
          font-size: 14px;
          color: #5f6368;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .breadcrumb-item.active {
          background: #e8f0fe;
          color: #4285F4;
          font-weight: 500;
        }

        .view-controls {
          display: flex;
          gap: 4px;
          background: #f1f3f4;
          padding: 4px;
          border-radius: 8px;
        }

        .view-btn {
          background: none;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: #5f6368;
          transition: all 0.2s;
        }

        .view-btn.active {
          background: white;
          color: #4285F4;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }

        /* Files Content */
        .files-content {
          padding: 24px;
        }

        .files-header {
          margin-bottom: 24px;
        }

        .files-header h1 {
          font-size: 32px;
          font-weight: 500;
          color: #202124;
          margin-bottom: 8px;
        }
        .files-stats {
          font-size: 14px;
          color: #5f6368;
        }

        /* Files Container */
        .files-container {
          display: grid;
          gap: 16px;
        }

        .files-container.grid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        .files-container.list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .file-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .files-container.grid .file-item {
          flex-direction: column;
          align-items: stretch;
        }

        .files-container.list .file-item {
          flex-direction: row;
          align-items: center;
        }
        .file-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-color: #d2d2d2;
        }

        .file-icon {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }

        .file-type-icon {
          font-size: 32px;
          display: block;
          text-align: center;
          line-height: 48px;
        }
        .file-star, .file-shared {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: white;
          border-radius: 50%;
          padding: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .file-shared {
          right: 12px;
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #202124;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-meta {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: #5f6368;
        }

        .files-container.list .file-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .file-type {
          background: #f1f3f4;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .files-container.list .file-type {
          background: none;
          padding: 0;
          min-width: 60px;
        }

        .file-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .file-item:hover .file-actions {
          opacity: 1;
        }

        .action-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          color: #5f6368;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f1f3f4;
        }

        .action-btn.starred {
          color: #FFD700;
        }
        
        .action-btn.shared {
          color: #4285F4;
        }

        .action-btn.delete:hover {
          background: #fce8e6;
          color: #ea4335;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1000;
            transform: translateX(-100%);
            width: 280px;
          }
          
          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar.collapsed {
            width: 280px;
          }

          .main-content, .main-content.collapsed {
            padding-left: 0;
          }

          .mobile-menu {
            display: block;
          }

          .sidebar-toggle {
            display: none;
          }
          .files-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .files-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .files-header h1 {
            font-size: 24px;
          }

          .files-content {
            padding: 16px;
          }
          
          .file-item {
            padding: 12px;
          }

          .file-actions {
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .files-container.grid {
            grid-template-columns: 1fr;
          }

          .files-container.list .file-item {
            flex-wrap: wrap;
          }

          .top-bar {
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;