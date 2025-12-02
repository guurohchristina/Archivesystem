
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

  useEffect(() => {
    fetchFiles();
  }, [currentPage, search, userIdFilter]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/admin/files?page=${currentPage}&limit=10`;
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

          {/* Pagination */}
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

export default ManageFiles;