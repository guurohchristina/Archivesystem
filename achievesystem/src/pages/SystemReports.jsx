
/*
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const SystemReports = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalStorage: 0,
    recentUsers: [],
    recentFiles: [],
    userGrowth: [],
    fileGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // In a real app, you'd have a dedicated reports API endpoint
      // For now, we'll simulate data
      const token = localStorage.getItem('token');
      
      // Fetch users and files to calculate stats
      const [usersRes, filesRes] = await Promise.all([
        fetch(`/api/admin/users?page=1&limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/files?page=1&limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const usersData = await usersRes.json();
      const filesData = await filesRes.json();
      
      if (usersData.success && filesData.success) {
        const totalStorage = filesData.data.files.reduce((sum, file) => sum + file.file_size, 0);
        
        // Calculate user growth (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentUsers = usersData.data.users.filter(u => 
          new Date(u.created_at) > sevenDaysAgo
        ).slice(0, 5);
        
        const recentFiles = filesData.data.files.slice(0, 5);
        
        setStats({
          totalUsers: usersData.data.pagination?.totalUsers || usersData.data.users.length,
          totalFiles: filesData.data.pagination?.totalFiles || filesData.data.files.length,
          totalStorage: totalStorage,
          recentUsers: recentUsers,
          recentFiles: recentFiles,
          userGrowth: calculateGrowth(usersData.data.users, 'created_at'),
          fileGrowth: calculateGrowth(filesData.data.files, 'uploaded_at')
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to simulated data
      setStats({
        totalUsers: 42,
        totalFiles: 156,
        totalStorage: 1024 * 1024 * 500, // 500MB
        recentUsers: [
          { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-10' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-09' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-08' }
        ],
        recentFiles: [
          { id: 1, original_name: 'document.pdf', user_name: 'John Doe', uploaded_at: '2024-01-10' },
          { id: 2, original_name: 'image.png', user_name: 'Jane Smith', uploaded_at: '2024-01-09' },
          { id: 3, original_name: 'video.mp4', user_name: 'Bob Johnson', uploaded_at: '2024-01-08' }
        ],
        userGrowth: [5, 7, 10, 15, 20, 25, 30, 42],
        fileGrowth: [10, 25, 40, 65, 90, 120, 140, 156]
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (data, dateField) => {
    // Simplified growth calculation
    const last30Days = Array(30).fill(0);
    data.forEach(item => {
      const date = new Date(item[dateField]);
      const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 30) {
        last30Days[29 - daysAgo]++;
      }
    });
    
    // Create cumulative growth
    const growth = [];
    let total = 0;
    for (let i = 0; i < 30; i += 4) {
      total += last30Days.slice(i, i + 4).reduce((a, b) => a + b, 0);
      growth.push(total);
    }
    
    return growth;
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
      <h1>System Reports</h1>
      
      <div className="reports-header">
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="range-select"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button onClick={fetchStats} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : (
        <div className="reports-grid">
          
          <div className="summary-cards">
            <div className="stat-card primary">
              <h3>Total Users</h3>
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-trend">+{Math.round(stats.userGrowth[stats.userGrowth.length - 1] / stats.totalUsers * 100)}% growth</div>
            </div>
            
            <div className="stat-card success">
              <h3>Total Files</h3>
              <div className="stat-number">{stats.totalFiles}</div>
              <div className="stat-trend">+{Math.round(stats.fileGrowth[stats.fileGrowth.length - 1] / stats.totalFiles * 100)}% growth</div>
            </div>
            
            <div className="stat-card warning">
              <h3>Storage Used</h3>
              <div className="stat-number">{formatFileSize(stats.totalStorage)}</div>
              <div className="stat-trend">Average: {formatFileSize(stats.totalStorage / stats.totalFiles)} per file</div>
            </div>
            
            <div className="stat-card info">
              <h3>Active Admins</h3>
              <div className="stat-number">1</div>
              <div className="stat-trend">You are the system admin</div>
            </div>
          </div>

          
          <div className="recent-activity">
            <div className="activity-card">
              <h3>Recent Users</h3>
              <div className="activity-list">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="activity-item">
                    <div className="activity-icon">👤</div>
                    <div className="activity-details">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                      <small>Joined: {formatDate(user.created_at)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="activity-card">
              <h3>Recent Files</h3>
              <div className="activity-list">
                {stats.recentFiles.map((file) => (
                  <div key={file.id} className="activity-item">
                    <div className="activity-icon">📄</div>
                    <div className="activity-details">
                      <strong>{file.original_name}</strong>
                      <small>By: {file.user_name}</small>
                      <small>Uploaded: {formatDate(file.uploaded_at)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
          <div className="growth-charts">
            <div className="chart-card">
              <h3>User Growth</h3>
              <div className="chart-container">
                <div className="bar-chart">
                  {stats.userGrowth.map((value, index) => (
                    <div key={index} className="bar-wrapper">
                      <div 
                        className="bar" 
                        style={{ height: `${(value / Math.max(...stats.userGrowth)) * 100}%` }}
                        title={`Week ${index + 1}: ${value} users`}
                      ></div>
                      <span className="bar-label">W{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>File Upload Growth</h3>
              <div className="chart-container">
                <div className="bar-chart">
                  {stats.fileGrowth.map((value, index) => (
                    <div key={index} className="bar-wrapper">
                      <div 
                        className="bar file-bar" 
                        style={{ height: `${(value / Math.max(...stats.fileGrowth)) * 100}%` }}
                        title={`Week ${index + 1}: ${value} files`}
                      ></div>
                      <span className="bar-label">W{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemReports;*/





import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const SystemReports = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalStorage: 0,
    recentUsers: [],
    recentFiles: [],
    userGrowth: [],
    fileGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const [error, setError] = useState("");

  const API_BASE = 'https://archivesystembackend.onrender.com';

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Fetch real data from your API endpoints
      const [usersRes, filesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users?page=1&limit=1000`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE}/api/admin/files?page=1&limit=1000`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Handle authentication/authorization errors
      if (usersRes.status === 401 || filesRes.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (usersRes.status === 403 || filesRes.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }

      const usersData = await usersRes.json();
      const filesData = await filesRes.json();

      console.log("📊 Users API response:", usersData);
      console.log("📊 Files API response:", filesData);

      if (usersData.success && filesData.success) {
        // Extract data based on your API structure
        const users = usersData.data?.users || usersData.users || usersData.data || [];
        const files = filesData.data?.files || filesData.files || filesData.data || [];
        
        // Calculate total storage
        const totalStorage = files.reduce((sum, file) => {
          return sum + (parseInt(file.file_size) || 0);
        }, 0);
        
        // Get time range for filtering
        const cutoffDate = new Date();
        if (timeRange === "7days") {
          cutoffDate.setDate(cutoffDate.getDate() - 7);
        } else if (timeRange === "30days") {
          cutoffDate.setDate(cutoffDate.getDate() - 30);
        } else if (timeRange === "90days") {
          cutoffDate.setDate(cutoffDate.getDate() - 90);
        }
        
        // Get recent users (last 5)
        const recentUsers = users
          .filter(u => {
            const userDate = new Date(u.created_at || u.createdAt || u.date);
            return timeRange === "all" || userDate > cutoffDate;
          })
          .sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || a.date);
            const dateB = new Date(b.created_at || b.createdAt || b.date);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at || user.createdAt,
            role: user.role
          }));
        
        // Get recent files (last 5)
        const recentFiles = files
          .filter(f => {
            const fileDate = new Date(f.uploaded_at || f.created_at || f.uploadedAt || f.date);
            return timeRange === "all" || fileDate > cutoffDate;
          })
          .sort((a, b) => {
            const dateA = new Date(a.uploaded_at || a.created_at || a.uploadedAt || a.date);
            const dateB = new Date(b.uploaded_at || b.created_at || b.uploadedAt || b.date);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(file => ({
            id: file.id,
            original_name: file.original_name || file.filename || file.name,
            user_name: file.user_name || file.user?.name || "Unknown",
            uploaded_at: file.uploaded_at || file.created_at || file.uploadedAt,
            file_size: file.file_size,
            file_type: file.file_type
          }));
        
        // Calculate growth data
        const userGrowth = calculateGrowth(users, 'created_at', timeRange);
        const fileGrowth = calculateGrowth(files, 'uploaded_at', timeRange);
        
        // Count admins
        const adminCount = users.filter(u => u.role === 'admin').length;
        
        setStats({
          totalUsers: users.length,
          totalFiles: files.length,
          totalStorage: totalStorage,
          recentUsers: recentUsers,
          recentFiles: recentFiles,
          userGrowth: userGrowth,
          fileGrowth: fileGrowth,
          adminCount: adminCount
        });
      } else {
        throw new Error('Failed to fetch data from server');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'Failed to load system reports');
      
      // Keep existing data or set empty
      if (stats.totalUsers === 0) {
        setStats({
          totalUsers: 0,
          totalFiles: 0,
          totalStorage: 0,
          recentUsers: [],
          recentFiles: [],
          userGrowth: [],
          fileGrowth: [],
          adminCount: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (data, dateField, range) => {
    if (!data || data.length === 0) return Array(7).fill(0);
    
    // Determine number of periods based on time range
    let periods = 7; // Default for 7 days
    let daysPerPeriod = 1;
    
    if (range === "30days") {
      periods = 6;
      daysPerPeriod = 5; // 5-day intervals
    } else if (range === "90days") {
      periods = 9;
      daysPerPeriod = 10; // 10-day intervals
    } else if (range === "all") {
      periods = 8;
    }
    
    const growth = new Array(periods).fill(0);
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a[dateField] || a.uploaded_at || a.created_at || a.date);
      const dateB = new Date(b[dateField] || b.uploaded_at || b.created_at || b.date);
      return dateA - dateB;
    });
    
    // Calculate cumulative growth per period
    let periodIndex = 0;
    let cumulativeCount = 0;
    
    sortedData.forEach(item => {
      const itemDate = new Date(item[dateField] || item.uploaded_at || item.created_at || item.date);
      const now = new Date();
      const daysAgo = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
      
      if (daysAgo >= 0) {
        if (range === "all") {
          // For "all time", just use the index
          cumulativeCount++;
          if (periodIndex < periods) {
            growth[periodIndex] = cumulativeCount;
            periodIndex++;
          }
        } else {
          // For time ranges, distribute by time
          const maxDays = range === "7days" ? 7 : range === "30days" ? 30 : 90;
          
          if (daysAgo <= maxDays) {
            cumulativeCount++;
            const period = Math.min(Math.floor(daysAgo / daysPerPeriod), periods - 1);
            growth[period] = cumulativeCount;
          }
        }
      }
    });
    
    // Fill any empty periods with the last value
    for (let i = 1; i < growth.length; i++) {
      if (growth[i] === 0 && growth[i - 1] > 0) {
        growth[i] = growth[i - 1];
      }
    }
    
    return growth;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleRetry = () => {
    fetchStats();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Calculate growth percentages
  const userGrowthPercent = stats.userGrowth.length > 1 && stats.totalUsers > 0 
    ? Math.round(((stats.userGrowth[stats.userGrowth.length - 1] - stats.userGrowth[0]) / stats.totalUsers) * 100)
    : 0;
  
  const fileGrowthPercent = stats.fileGrowth.length > 1 && stats.totalFiles > 0
    ? Math.round(((stats.fileGrowth[stats.fileGrowth.length - 1] - stats.fileGrowth[0]) / stats.totalFiles) * 100)
    : 0;

  // Add styles
  const errorStyle = {
    backgroundColor: '#fee',
    border: '1px solid #f99',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    color: '#c00'
  };

  const buttonStyle = {
    marginRight: '10px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div className="page" style={{ padding: '20px' }}>
      <h1>System Reports</h1>
      
      {/* Error Display */}
      {error && (
        <div style={errorStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ marginRight: '10px', fontSize: '20px' }}>⚠️</span>
            <h3 style={{ margin: 0, color: '#900' }}>Error</h3>
          </div>
          <p style={{ margin: '0 0 15px 0' }}>{error}</p>
          <div>
            <button 
              onClick={handleRetry}
              style={{ ...buttonStyle, backgroundColor: '#4CAF50', color: 'white' }}
            >
              Try Again
            </button>
            {error.includes('Authentication failed') && (
              <button 
                onClick={handleLogout}
                style={{ ...buttonStyle, backgroundColor: '#f44336', color: 'white' }}
              >
                Logout & Login Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Admin Access Warning */}
      {user?.role !== 'admin' && !error && (
        <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px', color: '#856404' }}>⚠️</span>
            <span style={{ fontWeight: 'bold', color: '#856404' }}>Admin Access Required</span>
          </div>
          <p style={{ margin: '5px 0 0 0', color: '#856404' }}>
            You need administrator privileges to view system reports. Your current role is: <strong>{user?.role || 'not set'}</strong>
          </p>
        </div>
      )}
      
      <div className="reports-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button 
          onClick={fetchStats} 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          Loading system reports...
        </div>
      ) : (
        <div className="reports-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Cards */}
          <div className="summary-cards" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div className="stat-card" style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '20px', 
              borderRadius: '8px',
              borderLeft: '4px solid #2196f3'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Total Users</h3>
              <div className="stat-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#0d47a1' }}>
                {stats.totalUsers}
              </div>
              <div className="stat-trend" style={{ marginTop: '10px', color: '#1976d2' }}>
                {userGrowthPercent >= 0 ? '+' : ''}{userGrowthPercent}% growth
              </div>
            </div>
            
            <div className="stat-card" style={{ 
              backgroundColor: '#e8f5e9', 
              padding: '20px', 
              borderRadius: '8px',
              borderLeft: '4px solid #4caf50'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Total Files</h3>
              <div className="stat-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#1b5e20' }}>
                {stats.totalFiles}
              </div>
              <div className="stat-trend" style={{ marginTop: '10px', color: '#388e3c' }}>
                {fileGrowthPercent >= 0 ? '+' : ''}{fileGrowthPercent}% growth
              </div>
            </div>
            
            <div className="stat-card" style={{ 
              backgroundColor: '#fff3e0', 
              padding: '20px', 
              borderRadius: '8px',
              borderLeft: '4px solid #ff9800'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#ef6c00' }}>Storage Used</h3>
              <div className="stat-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#e65100' }}>
                {formatFileSize(stats.totalStorage)}
              </div>
              <div className="stat-trend" style={{ marginTop: '10px', color: '#f57c00' }}>
                Average: {stats.totalFiles > 0 ? formatFileSize(stats.totalStorage / stats.totalFiles) : '0'} per file
              </div>
            </div>
            
            <div className="stat-card" style={{ 
              backgroundColor: '#f3e5f5', 
              padding: '20px', 
              borderRadius: '8px',
              borderLeft: '4px solid #9c27b0'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#7b1fa2' }}>Active Admins</h3>
              <div className="stat-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#4a148c' }}>
                {stats.adminCount || 1}
              </div>
              <div className="stat-trend" style={{ marginTop: '10px', color: '#8e24aa' }}>
                You are {user?.email || 'the system admin'}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            <div className="activity-card" style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                Recent Users ({timeRange})
              </h3>
              <div className="activity-list">
                {stats.recentUsers.length > 0 ? stats.recentUsers.map((user) => (
                  <div key={user.id} className="activity-item" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 0',
                    borderBottom: '1px solid #f5f5f5'
                  }}>
                    <div className="activity-icon" style={{ 
                      fontSize: '24px', 
                      marginRight: '15px',
                      backgroundColor: '#e3f2fd',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%'
                    }}>👤</div>
                    <div className="activity-details" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{user.name}</div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '2px' }}>{user.email}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Joined: {formatDate(user.created_at)} • Role: {user.role}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No recent users in this time period
                  </div>
                )}
              </div>
            </div>
            
            <div className="activity-card" style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                Recent Files ({timeRange})
              </h3>
              <div className="activity-list">
                {stats.recentFiles.length > 0 ? stats.recentFiles.map((file) => (
                  <div key={file.id} className="activity-item" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 0',
                    borderBottom: '1px solid #f5f5f5'
                  }}>
                    <div className="activity-icon" style={{ 
                      fontSize: '24px', 
                      marginRight: '15px',
                      backgroundColor: '#e8f5e9',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%'
                    }}>📄</div>
                    <div className="activity-details" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{file.original_name}</div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '2px' }}>By: {file.user_name}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Uploaded: {formatDate(file.uploaded_at)} • Size: {formatFileSize(file.file_size)}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No recent files in this time period
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Growth Charts */}
          <div className="growth-charts" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            <div className="chart-card" style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                User Growth
              </h3>
              <div className="chart-container">
                <div className="bar-chart" style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  height: '200px',
                  padding: '20px 0',
                  gap: '10px'
                }}>
                  {stats.userGrowth.map((value, index) => (
                    <div key={index} className="bar-wrapper" style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div 
                        className="bar" 
                        style={{ 
                          height: stats.userGrowth.length > 0 ? `${(value / Math.max(...stats.userGrowth.filter(v => v > 0))) * 90}%` : '0%',
                          backgroundColor: '#2196f3',
                          width: '30px',
                          borderRadius: '4px 4px 0 0'
                        }}
                        title={`Period ${index + 1}: ${value} users`}
                      ></div>
                      <span className="bar-label" style={{ 
                        marginTop: '5px', 
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>
                        {stats.userGrowth.length > 0 ? value : 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="chart-card" style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                File Upload Growth
              </h3>
              <div className="chart-container">
                <div className="bar-chart" style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  height: '200px',
                  padding: '20px 0',
                  gap: '10px'
                }}>
                  {stats.fileGrowth.map((value, index) => (
                    <div key={index} className="bar-wrapper" style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div 
                        className="bar file-bar" 
                        style={{ 
                          height: stats.fileGrowth.length > 0 ? `${(value / Math.max(...stats.fileGrowth.filter(v => v > 0))) * 90}%` : '0%',
                          backgroundColor: '#4caf50',
                          width: '30px',
                          borderRadius: '4px 4px 0 0'
                        }}
                        title={`Period ${index + 1}: ${value} files`}
                      ></div>
                      <span className="bar-label" style={{ 
                        marginTop: '5px', 
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>
                        {stats.fileGrowth.length > 0 ? value : 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemReports;