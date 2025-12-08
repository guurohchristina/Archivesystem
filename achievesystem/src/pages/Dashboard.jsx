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
import { 
  BarChart3, 
  FileText, 
  Users, 
  Database, 
  FolderOpen, 
  Upload, 
  Download,
  Search,
  Filter,
  Eye,
  Shield,
  Clock,
  TrendingUp,
  PieChart,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for dashboard data
  const [stats, setStats] = useState({
    totalFiles: 0,
    publicFiles: 0,
    storageUsed: 0,
    recentUploads: 0,
    sharedWithMe: 0,
    unclassified: 0
  });
  
  const [recentFiles, setRecentFiles] = useState([]);
  const [storageByType, setStorageByType] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalFiles: 1247,
        publicFiles: 89,
        storageUsed: 4.7, // GB
        recentUploads: 24,
        sharedWithMe: 45,
        unclassified: 12
      });
      
      setRecentFiles([
        { id: 1, name: 'Q4 Financial Report.pdf', type: 'pdf', size: '2.4 MB', uploaded: '2 hours ago', status: 'public', owner: 'John Doe' },
        { id: 2, name: 'Employee Handbook.docx', type: 'doc', size: '1.8 MB', uploaded: 'Yesterday', status: 'private', owner: 'HR Dept' },
        { id: 3, name: 'Project Timeline.xlsx', type: 'xlsx', size: '3.1 MB', uploaded: '2 days ago', status: 'shared', owner: 'Project Team' },
        { id: 4, name: 'Security Protocols.pdf', type: 'pdf', size: '5.2 MB', uploaded: '3 days ago', status: 'confidential', owner: 'Security' },
        { id: 5, name: 'Marketing Plan.pptx', type: 'ppt', size: '8.7 MB', uploaded: '1 week ago', status: 'public', owner: 'Marketing' }
      ]);
      
      setStorageByType([
        { type: 'Documents', value: 45, color: '#3B82F6' },
        { type: 'Images', value: 25, color: '#10B981' },
        { type: 'Videos', value: 15, color: '#8B5CF6' },
        { type: 'Audio', value: 8, color: '#F59E0B' },
        { type: 'Others', value: 7, color: '#EF4444' }
      ]);
      
      setActivityLog([
        { id: 1, user: 'John Doe', action: 'uploaded', file: 'Q4 Report.pdf', time: '10:30 AM', icon: 'upload' },
        { id: 2, user: 'Sarah Smith', action: 'shared', file: 'Project Docs.zip', time: '9:45 AM', icon: 'share' },
        { id: 3, user: 'System', action: 'classified', file: 'Contract #2451', time: 'Yesterday', icon: 'shield' },
        { id: 4, user: 'Alex Johnson', action: 'downloaded', file: 'Training Video.mp4', time: '2 days ago', icon: 'download' },
        { id: 5, user: 'You', action: 'made public', file: 'Team Photos', time: '3 days ago', icon: 'eye' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleQuickAction = (action) => {
    switch(action) {
      case 'upload':
        navigate('/upload');
        break;
      case 'browse':
        navigate('/my-files');
        break;
      case 'shared':
        navigate('/shared');
        break;
      case 'search':
        document.getElementById('global-search')?.focus();
        break;
    }
  };
  
  const formatStorage = (gb) => {
    if (gb < 1) return `${(gb * 1024).toFixed(1)} MB`;
    return `${gb.toFixed(1)} GB`;
  };
  
  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'xlsx': case 'csv': return '📊';
      case 'ppt': case 'pptx': return '📽️';
      case 'jpg': case 'png': case 'gif': return '🖼️';
      case 'mp4': case 'mov': return '🎬';
      case 'mp3': case 'wav': return '🎵';
      default: return '📎';
    }
  };
  
  const getStatusBadge = (status) => {
    const styles = {
      public: 'bg-blue-100 text-blue-800 border-blue-200',
      private: 'bg-gray-100 text-gray-800 border-gray-200',
      shared: 'bg-green-100 text-green-800 border-green-200',
      confidential: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const icons = {
      public: <Eye size={12} />,
      private: <Shield size={12} />,
      shared: <Users size={12} />,
      confidential: <AlertCircle size={12} />
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ArchiveFlow</h1>
            </div>
            
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="global-search"
                type="text"
                placeholder="Search across all documents..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Main</h2>
              <div className="space-y-1">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium"
                >
                  <BarChart3 size={20} />
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/upload')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  <Upload size={20} />
                  Upload Files
                </button>
                <button 
                  onClick={() => navigate('/my-files')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  <FolderOpen size={20} />
                  My Files
                </button>
                <button 
                  onClick={() => navigate('/shared')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  <Users size={20} />
                  Shared with Me
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {stats.sharedWithMe}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h2>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                  <FileText size={18} />
                  Documents
                  <span className="ml-auto text-gray-500 text-xs">892</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                  <span className="text-lg">🖼️</span>
                  Images
                  <span className="ml-auto text-gray-500 text-xs">214</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                  <span className="text-lg">🎬</span>
                  Videos
                  <span className="ml-auto text-gray-500 text-xs">78</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                  <span className="text-lg">📊</span>
                  Spreadsheets
                  <span className="ml-auto text-gray-500 text-xs">145</span>
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => handleQuickAction('upload')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload size={18} />
                  Upload New
                </button>
                <button 
                  onClick={() => handleQuickAction('search')}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Search size={18} />
                  Advanced Search
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
                <p className="text-gray-600">Here's what's happening with your archive today.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Timeframe:</span>
                <select 
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalFiles.toLocaleString()}</h3>
              <p className="text-gray-600">Total Files</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <span>24 new today</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.publicFiles}</h3>
              <p className="text-gray-600">Public Files</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Users size={14} className="mr-1" />
                  <span>Shared with {stats.sharedWithMe} users</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatStorage(stats.storageUsed)}</h3>
              <p className="text-gray-600">Storage Used</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(stats.storageUsed / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{((stats.storageUsed / 10) * 100).toFixed(1)}% of 10GB used</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.unclassified}</h3>
              <p className="text-gray-600">Requires Attention</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center">
                  Review now
                  <ChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Files */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Files</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </button>
              </div>
              
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.owner}</span>
                          <span>•</span>
                          <span>{file.uploaded}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(file.status)}
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage by Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Storage by Type</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <PieChart size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                {storageByType.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium text-gray-900">{item.type}</span>
                      </div>
                      <span className="text-gray-900 font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Storage available</span>
                  <span className="font-medium text-gray-900">{formatStorage(10 - stats.storageUsed)} free</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Filter size={18} className="text-gray-600" />
                </button>
                
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all activity
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {activity.icon === 'upload' && <Upload size={20} className="text-blue-600" />}
                    {activity.icon === 'share' && <Users size={20} className="text-green-600" />}
                    {activity.icon === 'shield' && <Shield size={20} className="text-purple-600" />}
                  {activity.icon === 'download' && <Download size={20} className="text-orange-600" />}
                    {activity.icon === 'eye' && <Eye size={20} className="text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.file}</span>
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-900">System Status</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">All systems operational</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-900">Last Backup</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Today, 2:00 AM</p>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Pending Actions</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{stats.unclassified} items</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Activity Today</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">+24% from yesterday</p>
            </div>
          </div>
        </main>
      </div>

      {/* Global Alert Banner */}
      {stats.unclassified > 0 && (
        <div className="fixed bottom-4 right-4 max-w-md bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Attention Required</p>
              <p className="text-sm text-gray-600 mt-1">
                You have {stats.unclassified} unclassified documents that need review.
              </p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                Review now →
              </button>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded">
              <XCircle size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;