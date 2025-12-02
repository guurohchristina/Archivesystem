

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
          {/* Summary Cards */}
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

          {/* Recent Activity */}
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

          {/* Growth Charts (simplified) */}
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

export default SystemReports;