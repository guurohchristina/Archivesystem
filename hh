*
              <div className="file-selected" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: '#fff',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="file-icon" style={{ fontSize: '40px' }}>
                    {selectedFile.type.startsWith('image/') ? '🖼️' : 
                     selectedFile.type.includes('pdf') ? '📄' :
                     selectedFile.type.includes('video') ? '🎬' :
                     selectedFile.type.includes('audio') ? '🎵' : 
                     selectedFile.type.includes('spreadsheet') ? '📊' :
                     selectedFile.type.includes('presentation') ? '📽️' : '📁'}
                  </div>
                  <div className="file-details">
                    <h4 style={{ margin: '0 0 5px 0' }}>{selectedFile.name}</h4>
                    <p style={{ margin: '2px 0', fontSize: '14px', color: '#666' }}>Size: {formatFileSize(selectedFile.size)}</p>
                    <p style={{ margin: '2px 0', fontSize: '14px', color: '#666' }}>Type: {selectedFile.type || "Unknown"}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="remove-file-btn"
                  style={{ 
                    background: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '30px', 
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="file-placeholder">
                <div className="upload-icon" style={{ fontSize: '48px', marginBottom: '10px' }}>📤</div>
                <p style={{ fontSize: '18px', margin: '10px 0' }}>Click to select a file</p>
                <small style={{ color: '#666', display: 'block' }}>Max file size: 50MB</small>
                <small style={{ color: '#666' }}>Drag & drop supported</small>
              </div>
            )}
          </div>*/