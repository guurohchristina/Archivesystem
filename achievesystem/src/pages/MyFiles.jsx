
// src/pages/MyFiles.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const MyFiles = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchUserFiles();
  }, [currentPage, sortBy]);

  const fetchUserFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/upload/my-files?page=${currentPage}&limit=10&sort=${sortBy}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setFiles(result.data.files);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('File deleted successfully');
        fetchUserFiles(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
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
      <h1>My Files</h1>
      
      <div className="files-header">
        <div className="sort-options">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">Size (Largest)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="no-files">
          <p>You haven't uploaded any files yet.</p>
          <button onClick={() => window.location.href = '/upload'}>
            Upload Your First File
          </button>
        </div>
      ) : (
        <>
          <div className="files-list">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-icon">
                  {file.file_type.startsWith('image/') ? '🖼️' : 
                   file.file_type.includes('pdf') ? '📄' :
                   file.file_type.includes('video') ? '🎬' :
                   file.file_type.includes('audio') ? '🎵' : '📁'}
                </div>
                
                <div className="file-info">
                  <h3>{file.original_name}</h3>
                  <div className="file-meta">
                    <span>Size: {formatFileSize(file.file_size)}</span>
                    <span>Type: {file.file_type}</span>
                    <span>Uploaded: {formatDate(file.uploaded_at)}</span>
                  </div>
                  {file.description && (
                    <p className="file-description">{file.description}</p>
                  )}
                </div>
                
                <div className="file-actions">
                  <a 
                    href={`/uploads/${file.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn view-btn"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="action-btn delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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

export default MyFiles;