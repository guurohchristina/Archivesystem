import { useState, useEffect } from "react";

const MyFiles = () => {
  const [files, setFiles] = useState([
    { id: 1, name: "Annual Report 2024.pdf", type: "pdf", size: "2.4 MB", date: "Today", starred: true, shared: false },
    { id: 2, name: "Project Proposal.docx", type: "doc", size: "1.8 MB", date: "Yesterday", starred: false, shared: true },
    { id: 3, name: "Team Meeting.mp4", type: "video", size: "45.2 MB", date: "2 days ago", starred: true, shared: false },
    { id: 4, name: "Company Logo.png", type: "image", size: "3.1 MB", date: "Nov 12", starred: false, shared: false },
    { id: 5, name: "Financial Data.xlsx", type: "spreadsheet", size: "5.7 MB", date: "Nov 10", starred: false, shared: true },
    { id: 6, name: "Design Assets.zip", type: "archive", size: "125.4 MB", date: "Nov 5", starred: true, shared: false },
  ]);
  
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  console.log("MyFiles component is rendering!");

  // Get file icon
  const getFileIcon = (type) => {
    const icons = {
      pdf: "📄",
      doc: "📝",
      video: "🎬",
      image: "🖼️",
      spreadsheet: "📊",
      archive: "📦",
    };
    return icons[type] || "📎";
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>
        TEST: MyFiles is Rendering!
      </h1>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#202124',
            margin: '0 0 8px 0'
          }}>
            My Files
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#5f6368',
            margin: 0
          }}>
            {files.length} files • 4.7 GB used
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: '#f8f9fa',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid #dadce0'
          }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? '#4285F4' : '#5f6368',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ◼️◼️
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? '#4285F4' : '#5f6368',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ☰
            </button>
          </div>
          
          <button
            onClick={() => alert("Upload clicked")}
            style={{
              backgroundColor: '#4285F4',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📤 Upload New File
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f3f4',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <span style={{ marginRight: '12px', fontSize: '18px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              color: '#202124',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Files Grid/List */}
      <div style={{
        display: viewMode === 'grid' ? 'grid' : 'flex',
        flexDirection: viewMode === 'list' ? 'column' : 'row',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(250px, 1fr))' : 'none',
        gap: '16px'
      }}>
        {filteredFiles.map((file) => (
          <div key={file.id} style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: viewMode === 'grid' ? '20px' : '16px',
            display: 'flex',
            flexDirection: viewMode === 'grid' ? 'column' : 'row',
            alignItems: viewMode === 'grid' ? 'stretch' : 'center',
            gap: viewMode === 'grid' ? '16px' : '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}>
            {/* File Icon */}
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '48px' }}>
                {getFileIcon(file.type)}
              </span>
              {file.starred && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  fontSize: '16px',
                  color: '#FFD700',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  ⭐
                </span>
              )}
              {file.shared && (
                <span style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  fontSize: '14px',
                  color: '#4285F4',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  🔗
                </span>
              )}
            </div>
            
            {/* File Info */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#202124',
                margin: '0 0 12px 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {file.name}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: viewMode === 'list' ? '16px' : '8px',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#4285F4',
                  backgroundColor: viewMode === 'list' ? 'transparent' : '#f1f3f4',
                  padding: viewMode === 'list' ? '0' : '4px 8px',
                  borderRadius: '12px'
                }}>
                  {file.type.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#5f6368'
                }}>
                  {file.size}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#5f6368'
                }}>
                  {file.date}
                </span>
              </div>
            </div>
            
            {/* File Actions */}
            <div style={{
              display: 'flex',
              flexDirection: viewMode === 'grid' ? 'row' : 'column',
              gap: '8px'
            }}>
              <button 
                onClick={() => {
                  const updatedFiles = files.map(f => 
                    f.id === file.id ? { ...f, starred: !f.starred } : f
                  );
                  setFiles(updatedFiles);
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: file.starred ? '#FFD700' : '#5f6368',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={file.starred ? "Unstar" : "Star"}
              >
                {file.starred ? '★' : '☆'}
              </button>
              <button 
                onClick={() => alert(`Share ${file.name}`)}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: file.shared ? '#4285F4' : '#5f6368',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={file.shared ? "Shared" : "Share"}
              >
                🔗
              </button>
              <button 
                onClick={() => alert(`Download ${file.name}`)}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#5f6368',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Download"
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        color: '#5f6368',
        fontSize: '14px'
      }}>
        Showing {filteredFiles.length} of {files.length} files
        {searchTerm && (
          <span style={{ color: '#4285F4', fontStyle: 'italic', marginLeft: '8px' }}>
            (filtered)
          </span>
        )}
      </div>
    </div>
  );
};

export default MyFiles;