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






import { useState, useEffect, useContext } from "react";
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
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to track active navigation item
  const [activeNav, setActiveNav] = useState("my-files");
  
  // Determine active nav based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/upload")) setActiveNav("upload");
    else if (path.includes("/my-files")) setActiveNav("my-files");
    else if (path.includes("/shared")) setActiveNav("shared");
    else setActiveNav("my-files"); // Default
  }, [location]);
  
  // Navigation items configuration
  const mainNavItems = [
    { id: "upload", label: "Upload Files", icon: <Upload size={20} />, path: "/upload" },
    { id: "my-files", label: "My Files", icon: <Folder size={20} />, path: "/my-files" },
    { id: "shared", label: "Shared with Me", icon: <Users size={20} />, path: "/shared" },
  ];
  
  const categoryItems = [
    { id: "documents", label: "Documents", icon: <FileText size={20} />, count: 892 },
    { id: "videos", label: "Videos", icon: <Video size={20} />, count: 214 },
    { id: "images", label: "Images", icon: <Image size={20} />, count: 156 },
    { id: "audio", label: "Audio", icon: <Music size={20} />, count: 78 },
    { id: "archives", label: "Archives", icon: <Archive size={20} />, count: 45 },
  ];
  
  const userItems = [
    { id: "profile", label: "Profile", icon: <User size={20} />, action: () => navigate("/profile") },
    { id: "settings", label: "Settings", icon: <Settings size={20} />, action: () => navigate("/settings") },
    { id: "logout", label: "Logout", icon: <LogOut size={20} />, action: logout },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Vertical Navigation */}
      <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Main Navigation */}
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Navigation
          </h2>
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setActiveNav(item.id);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeNav === item.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Categories Section */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Categories
          </h2>
          <ul className="space-y-1">
            {categoryItems.map((item) => (
              <li key={item.id}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        {/* User Section - Pushes to bottom */}
        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>
          
          <ul className="space-y-1">
            {userItems.map((item) => (
              <li key={item.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    item.action();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.id === "logout"
                      ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content Area - My Files as default */}
      <main className="flex-1 p-8">
        {activeNav === "my-files" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
              <p className="text-gray-600">All files uploaded by you</p>
            </div>
            
            {/* File grid - You'll populate this with your actual files */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Example file cards */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">📄</div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PDF</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Quarterly Report.pdf</h3>
                <p className="text-xs text-gray-500 mb-3">2.4 MB • 2 days ago</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Private</span>
                  <button className="text-blue-600 hover:text-blue-800">⋮</button>
                </div>
              </div>
              
              {/* Add more file cards here */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">📝</div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DOC</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Project Proposal.docx</h3>
                <p className="text-xs text-gray-500 mb-3">1.8 MB • 1 week ago</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shared</span>
                  <button className="text-blue-600 hover:text-blue-800">⋮</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Upload page would show here when activeNav === "upload" */}
        {/* Shared page would show here when activeNav === "shared" */}
      </main>
    </div>
  );
};

export default Dashboard;