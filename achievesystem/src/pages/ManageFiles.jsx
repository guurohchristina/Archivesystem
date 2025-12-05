
/*
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const ManageFiles = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState("");

const API_BASE ='https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev'


  useEffect(() => {
    fetchFiles();
  }, [currentPage, search, userIdFilter]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE}/api/admin/files?page=${currentPage}&limit=10`;
      if (search) url += `&search=${search}`;
      if (userIdFilter) url += `&userId=${userIdFilter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFiles(result.data.files);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      alert('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete file "${fileName}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('File deleted successfully');
        fetchFiles(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
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
      <h1>Manage Files</h1>
      
      <div className="admin-header">
        <div className="filters-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <input
              type="number"
              placeholder="Filter by User ID"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="filter-input"
            />
          </div>
          <button onClick={fetchFiles} className="filter-btn">
            Apply Filters
          </button>
        </div>
        <div className="stats-summary">
          <span>Total Files: {files.length > 0 ? files[0]?.pagination?.totalFiles || 'Loading...' : '0'}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="no-data">
          <p>No files found.</p>
        </div>
      ) : (
        <>
          <div className="files-table-container">
            <table className="files-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>File Name</th>
                  <th>User</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  <th>Public</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.id}</td>
                    <td className="filename-cell">
                      <div className="file-name">
                        {file.original_name}
                        {file.description && (
                          <small className="file-desc">{file.description}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <strong>{file.user_name}</strong>
                        <small>{file.user_email}</small>
                        <small>ID: {file.user_id}</small>
                      </div>
                    </td>
                    <td>{formatFileSize(file.file_size)}</td>
                    <td>
                      <span className="file-type-badge">
                        {file.file_type.split('/')[0]}
                      </span>
                    </td>
                    <td>{formatDate(file.uploaded_at)}</td>
                    <td>
                      <span className={`public-badge ${file.is_public ? 'public' : 'private'}`}>
                        {file.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <a 
                          href={`/uploads/${file.filename}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="action-btn view-btn"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteFile(file.id, file.original_name)}
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default ManageFiles;*/







import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const ManageFiles = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [error, setError] = useState("");
  const [totalFiles, setTotalFiles] = useState(0);

  const API_BASE = 'https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev';

  useEffect(() => {
    fetchFiles();
  }, [currentPage, search, userIdFilter]);

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      
      // Validate token
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      
      // Debug: Log token info
      console.log("🔍 Fetching files with token:", token ? `${token.substring(0, 30)}...` : "No token");
      
      // Decode token to check role
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("👤 Token payload:", {
            email: payload.email,
            role: payload.role,
            exp: new Date(payload.exp * 1000).toLocaleString()
          });
        }
      } catch (decodeError) {
        console.warn("Could not decode token:", decodeError.message);
      }

      // Build URL with query parameters
      const url = new URL(`${API_BASE}/api/admin/files`);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', '10');
      if (search) {
        url.searchParams.append('search', search);
      }
      if (userIdFilter) {
        url.searchParams.append('userId', userIdFilter);
      }

      console.log("🌐 Request URL:", url.toString());

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📨 Response status:", response.status);

      // Handle different HTTP statuses
      if (response.status === 401) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access denied. Admin privileges required.');
      } else if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📦 API Response:", result);

      if (result.success) {
        // Handle different response structures
        if (result.data && Array.isArray(result.data.files)) {
          // Structure: { success: true, data: { files: [...], pagination: {...} } }
          setFiles(result.data.files);
          setTotalPages(result.data.pagination?.totalPages || 1);
          setTotalFiles(result.data.pagination?.totalFiles || 0);
        } else if (Array.isArray(result.files)) {
          // Structure: { success: true, files: [...], pagination: {...} }
          setFiles(result.files);
          setTotalPages(result.pagination?.totalPages || 1);
          setTotalFiles(result.pagination?.totalFiles || 0);
        } else if (Array.isArray(result.data)) {
          // Structure: { success: true, data: [...] }
          setFiles(result.data);
          setTotalPages(1);
          setTotalFiles(result.data.length);
        } else {
          console.error("Unexpected response structure:", result);
          throw new Error('Unexpected response format from server');
        }
      } else {
        throw new Error(result.message || 'Request failed');
      }

    } catch (error) {
      console.error('❌ Error fetching files:', error);
      
      // Set user-friendly error message
      if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('malformed')) {
        setError('Authentication failed: Invalid or expired session. Please log out and log in again.');
        localStorage.removeItem('token');
      } else if (error.message.includes('Access denied') || error.message.includes('Admin') || error.message.includes('403')) {
        setError(`Access denied: ${error.message}. Your role: ${user?.role || 'not set'}`);
      } else {
        setError(error.message || 'Failed to load files. Please try again.');
      }
      
      // Clear files on error
      setFiles([]);
      setTotalPages(1);
      setTotalFiles(0);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete file "${fileName}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No authentication token found');
        return;
      }
      
      const response = await fetch(`${API_BASE}/api/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert('File deleted successfully');
        fetchFiles(); // Refresh list
      } else {
        throw new Error(result.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Failed to delete file: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
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
    fetchFiles();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Add CSS for error display
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
      <h1>Manage Files</h1>
      
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
            You need administrator privileges to manage files. Your current role is: <strong>{user?.role || 'not set'}</strong>
          </p>
        </div>
      )}

      {/* Debug Info - Remove in production */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #e9ecef', 
        borderRadius: '8px', 
        padding: '10px', 
        marginBottom: '20px',
        fontSize: '12px',
        display: 'none' /* Set to 'block' to see debug info */
      }}>
        <strong>Debug Info:</strong><br />
        User Role: {user?.role}<br />
        Token: {localStorage.getItem('token') ? 'Exists' : 'Missing'}<br />
        Loading: {loading.toString()}<br />
        Files Count: {files.length}
      </div>
      
      <div className="admin-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div className="filters-row" style={{ display: 'flex', gap: '10px' }}>
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '10px',
                width: '200px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div className="filter-group">
            <input
              type="text"
              placeholder="Filter by User ID"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              style={{
                padding: '10px',
                width: '150px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <button 
            onClick={fetchFiles} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Apply Filters
          </button>
        </div>
        <div className="stats-summary" style={{ fontWeight: 'bold', color: '#333' }}>
          <span>Total Files: {loading ? 'Loading...' : totalFiles}</span>
        </div>
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
          Loading files...
        </div>
      ) : files.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
          <h3>No files found</h3>
          <p>{search || userIdFilter ? 'Try different filters or search terms' : 'No files in the system'}</p>
          {(search || userIdFilter) && (
            <button 
              onClick={() => { setSearch(''); setUserIdFilter(''); }}
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="files-table-container" style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table className="files-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>File Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>User</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Size</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Uploaded</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Public</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{file.id}</td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{file.original_name || file.filename || 'Unknown'}</div>
                        {file.description && (
                          <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                            {file.description}
                          </small>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{file.user_name || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{file.user_email || ''}</div>
                        {file.user_id && (
                          <div style={{ fontSize: '11px', color: '#888' }}>ID: {file.user_id}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{formatFileSize(file.file_size)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: '#e9ecef',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {file.file_type ? file.file_type.split('/')[0] : 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{formatDate(file.uploaded_at || file.created_at)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: file.is_public ? '#d4edda' : '#f8d7da',
                        color: file.is_public ? '#155724' : '#721c24',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {file.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {file.filename && (
                          <a 
                            href={`${API_BASE}/uploads/${file.filename}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          >
                            View
                          </a>
                        )}
                        <button
                          onClick={() => deleteFile(file.id, file.original_name || file.filename || 'file')}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '20px', 
              marginTop: '30px' 
            }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === 1 ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              
              <span style={{ fontWeight: 'bold' }}>Page {currentPage} of {totalPages}</span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === totalPages ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
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

export default ManageFiles;