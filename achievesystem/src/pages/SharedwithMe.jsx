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

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    if (user) {
      fetchPublicFiles();
    }
  }, [user, currentPage, search, filterOwner]);

  useEffect(() => {
    // Extract unique owners from files
    const owners = [...new Set(publicFiles.map(file => file.owner_name || file.user_name))].filter(Boolean);
    setFileOwners(owners);
  }, [publicFiles]);

  const fetchPublicFiles = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Use the new endpoint: /api/upload/public
      /*
      const url = new URL(`${API_BASE}/api/upload/public`);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', '20');
      if (search) {
        url.searchParams.append('search', search);
      }*/
      
      //Build URL correctly - NO DUPLICATE PARAMS
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', '20');
    if (search) params.append('search', search);
    if (filterOwner) params.append('owner', filterOwner);
    
    // Remove any duplicate params
    const url = `${API_BASE}/api/upload/public?${params.toString()}`;
      
      
      
      
     /* if (filterOwner) {
        url.searchParams.append('owner', filterOwner);
      }*/

      console.log("🌐 Fetching public files from:", url.toString());

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📨 Response status:", response.status);

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (!response.ok) {
        const errorText = await response.text();
        console.error("Error details:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📦 Public files API Response:", result);

      if (result.success) {
        setPublicFiles(result.data?.files || []);
        setTotalPages(result.data?.pagination?.totalPages || 1);
        setTotalFiles(result.data?.pagination?.totalFiles || 0);
      } else {
        throw new Error(result.message || 'Failed to load public files');
      }

    } catch (error) {
      console.error("❌ Error in fetchPublicFiles:", error);
      setError(error.message || 'Failed to load shared files. Please try again.');
      setPublicFiles([]);
      setTotalPages(1);
      setTotalFiles(0);
    } finally {
      setLoading(false);
    }
  };

  const makeFilePrivate = async (fileId) => {
    if (!window.confirm('Are you sure you want to make this file private? It will be removed from the public shared list.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Use the new endpoint: /api/upload/:id/visibility
      const response = await fetch(`${API_BASE}/api/upload/${fileId}/visibility`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_public: false })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('File set to private successfully');
        fetchPublicFiles(); // Refresh the list
      } else {
        throw new Error(result.message || 'Failed to update file visibility');
      }
    } catch (error) {
      console.error('Error making file private:', error);
      alert(`Failed to update file: ${error.message}`);
    }
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      
      // Use the existing download endpoint
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
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
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
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleRetry = () => {
    fetchPublicFiles();
  };

  const isFileOwner = (file) => {
    return file.user_id === user?.id || file.owner_id === user?.id;
  };

  return (
    <div className="page" style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1>Public Files Shared With Me</h1>
        <p style={{ color: '#666', marginTop: '5px' }}>
          Browse files shared publicly by other users in the archive
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          border: '1px solid #f99', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ marginRight: '10px', fontSize: '20px' }}>⚠️</span>
            <h3 style={{ margin: 0, color: '#900' }}>Error</h3>
          </div>
          <p style={{ margin: '0 0 15px 0' }}>{error}</p>
          <button 
            onClick={handleRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Controls Section */}
      <div className="controls-section" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div className="stats" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="stat-item" style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '10px 15px', 
            borderRadius: '6px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: '500' }}>Total Public Files</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d47a1' }}>
              {loading ? '...' : totalFiles}
            </div>
          </div>
        </div>

        <div className="filters" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
              fontSize: '14px'
            }}
          />
          
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">All Owners</option>
            {fileOwners.map((owner, index) => (
              <option key={index} value={owner}>{owner}</option>
            ))}
          </select>
          
          <button
            onClick={() => { setSearch(''); setFilterOwner(''); }}
            style={{
              padding: '10px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear Filters
          </button>
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
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          Loading public files...
        </div>
      ) : publicFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📂</div>
          <h3>No public files available</h3>
          <p>
            {search || filterOwner 
              ? 'No files match your filters. Try different search terms.' 
              : 'No users have shared files publicly yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Files Table */}
          <div className="files-table-container" style={{ 
            overflowX: 'auto', 
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <table className="files-table" style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Filename</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Owner</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Size</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Shared On</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publicFiles.map((file) => (
                  <tr key={file.id} style={{ 
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>
                          {file.file_type?.includes('image') ? '🖼️' :
                           file.file_type?.includes('pdf') ? '📄' :
                           file.file_type?.includes('word') || file.file_type?.includes('document') ? '📝' :
                           file.file_type?.includes('spreadsheet') || file.file_type?.includes('excel') ? '📊' :
                           '📎'}
                        </span>
                        {file.original_name || file.filename || file.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Type: {file.file_type || 'Unknown'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '300px' }}>
                      <div style={{ 
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {file.description || 'No description'}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '500' }}>{file.owner_name || file.user_name || 'Unknown'}</div>
                      {file.owner_email && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{file.owner_email}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{formatFileSize(file.file_size)}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{formatDate(file.public_since || file.created_at)}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => downloadFile(file.id, file.original_name || file.filename)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                          title="Download file"
                        >
                          Download
                        </button>
                        
                        {isFileOwner(file) && (
                          <button
                            onClick={() => makeFilePrivate(file.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                            title="Make this file private (only you can access it)"
                          >
                            Make Private
                          </button>
                        )}
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
                  padding: '10px 20px',
                  backgroundColor: currentPage === 1 ? '#e9ecef' : '#007bff',
                  color: currentPage === 1 ? '#adb5bd' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                ← Previous
              </button>
              
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentPage === totalPages ? '#e9ecef' : '#007bff',
                  color: currentPage === totalPages ? '#adb5bd' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SharedWithMe;