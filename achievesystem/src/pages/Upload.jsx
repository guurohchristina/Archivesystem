/*import { useState } from "react";
import axiosClient from "../api/axiosClient.jsx";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("");
  const [owner, setOwner] = useState("");
  const [classification, setClassification] = useState("");
  const [date, setDate] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      alert("Please select at least one file");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("title", title);
    formData.append("department", department);
    formData.append("type", type);
    formData.append("owner", owner);
    formData.append("classification", classification);
    formData.append("date", date);

    try {
      const response = await axiosClient.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data); // <-- this shows the uploaded files from backend
      alert("Upload successful!");
      setFiles([]);
      setTitle("");
      setDepartment("");
      setType("");
      setOwner("");
      setClassification("");
      setDate("");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  return (
    <div className="page">
      <h1>Upload Document</h1>
      <form className="form" onSubmit={submit}>
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <input
          type="text"
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <input
          type="text"
          placeholder="Classification"
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">Select Department</option>
          <option value="IT">IT</option>
          <option value="Finance">Finance</option>
          <option value="HR">HR</option>
        </select>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Upload;*/



/*fall back on
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Upload = () => {
  const { user } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // TODO: Implement actual file upload to backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      alert(`File "${selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      alert("Upload failed: " + error.message);
      clearInterval(progressInterval);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <h1>Upload Files</h1>
      
      <div className="upload-info">
        <p><strong>User:</strong> {user?.name}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Max file size:</strong> 10MB</p>
        <p><strong>Allowed formats:</strong> All file types</p>
      </div>

      <form className="upload-form" onSubmit={handleUpload}>
        <div className="file-input-area">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <div className="file-info">
              <p><strong>Selected File:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {selectedFile.type || "Unknown"}</p>
            </div>
          )}
        </div>

        {uploading && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!selectedFile || uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>

      <div className="upload-history">
        <h2>Recent Uploads</h2>
        <p>Upload history will be displayed here once files are uploaded.</p>
      
      </div>

      {user?.role === "admin" && (
        <div className="admin-upload-notes">
          <h3>Admin Notes</h3>
          <p>As an administrator, you can upload system files and manage all user uploads.</p>
        </div>
      )}
    </div>
  );
};

export default Upload;*/







/*fall backon

import { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Document metadata state
  const [fileDescription, setFileDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [department, setDepartment] = useState("");
  const [owner, setOwner] = useState("");
  const [classificationLevel, setClassificationLevel] = useState("Unclassified");
  
  // Predefined options
  const documentTypes = [
    "Report", "Memo", "Contract", "Invoice", "Certificate", 
    "Policy", "Procedure", "Form", "Presentation", "Spreadsheet",
    "Image", "Video", "Audio", "Email", "Other"
  ];
  
  const departments = [
    "Administration", "Finance", "Human Resources", "IT", "Legal",
    "Marketing", "Operations", "Procurement", "Sales", "Research & Development"
  ];
  
  const classificationLevels = [
    "Unclassified",
    "Confidential", 
    "Secret", 
    "Top Secret"
  ];
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setUploadError("File size must be less than 50MB");
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setUploadError("");
      
      // Auto-set some metadata based on filename
      const fileName = file.name.toLowerCase();
      if (fileName.includes("report") || fileName.includes("analysis")) {
        setDocumentType("Report");
      } else if (fileName.includes("invoice") || fileName.includes("bill")) {
        setDocumentType("Invoice");
      } else if (fileName.includes("contract") || fileName.includes("agreement")) {
        setDocumentType("Contract");
      }
      
      // Auto-set owner to current user's name
      if (user?.name) {
        setOwner(user.name);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', fileDescription);
    formData.append('isPublic', isPublic.toString());
    formData.append('document_type', documentType);
    formData.append('document_date', documentDate);
    formData.append('department', department);
    formData.append('owner', owner);
    formData.append('classification_level', classificationLevel);

    // Simulate progress (optional)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type for FormData
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload result:", result);
      
      if (result.success) {
        setUploadSuccess(true);
        
        // Reset form after successful upload
        setTimeout(() => {
          resetForm();
          navigate('/my-files');
        }, 2000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileDescription("");
    setIsPublic(false);
    setDocumentType("");
    setDocumentDate("");
    setDepartment("");
    setOwner(user?.name || "");
    setClassificationLevel("Unclassified");
    setUploadError("");
    setUploadSuccess(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="page">
      <h1>Upload Document</h1>
      
      
      {uploadSuccess && (
        <div className="success-message">
          ✅ File uploaded successfully! Redirecting to My Files...
        </div>
      )}
      
    
      {uploadError && (
        <div className="error-message">
          ❌ {uploadError}
        </div>
      )}
      
      <form className="upload-form" onSubmit={handleUpload}>
        
        <div className="upload-section">
          <h3>1. Select File</h3>
          
          <div className="file-input-area" onClick={triggerFileInput}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
              <div className="file-selected">
                <div className="file-icon">
                  {selectedFile.type.startsWith('image/') ? '🖼️' : 
                   selectedFile.type.includes('pdf') ? '📄' :
                   selectedFile.type.includes('video') ? '🎬' :
                   selectedFile.type.includes('audio') ? '🎵' : '📁'}
                </div>
                <div className="file-details">
                  <h4>{selectedFile.name}</h4>
                  <p>Size: {formatFileSize(selectedFile.size)}</p>
                  <p>Type: {selectedFile.type || "Unknown"}</p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="file-placeholder">
                <div className="upload-icon">📤</div>
                <p>Click to select a file</p>
                <small>Max file size: 50MB</small>
              </div>
            )}
          </div>
          
          <div className="file-types-info">
            <small>Supported formats: PDF, Word, Excel, PowerPoint, Images, Videos, Audio, Text</small>
          </div>
        </div>
        
        
        <div className="upload-section">
          <h3>2. Document Information</h3>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Describe this document..."
              rows="3"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Document Type *</label>
              <select 
                value={documentType} 
                onChange={(e) => setDocumentType(e.target.value)}
                required
              >
                <option value="">Select document type...</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Document Date</label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select department...</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Owner *</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Document owner"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Classification Level *</label>
              <select 
                value={classificationLevel} 
                onChange={(e) => setClassificationLevel(e.target.value)}
                required
              >
                {classificationLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Make this file public
              </label>
              <small className="checkbox-hint">
                Public files can be accessed by other users
              </small>
            </div>
          </div>
        </div>
        
        
        {uploading && (
          <div className="upload-section">
            <h3>3. Upload Progress</h3>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
              <p className="progress-text">
                {uploadProgress < 100 ? "Uploading..." : "Processing..."}
              </p>
            </div>
          </div>
        )}
        
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetForm}
            className="secondary-btn"
            disabled={uploading}
          >
            Clear Form
          </button>
          
          <button 
            type="submit" 
            disabled={uploading || !selectedFile}
            className="primary-btn"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
        
        
        <div className="user-upload-info">
          <p>
            <strong>Uploading as:</strong> {user?.name} ({user?.email})
          </p>
          <p>
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </form>
    </div>
  );
};

export default Upload;*/




/*
// In your Upload.jsx component
const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileDescription, setFileDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [department, setDepartment] = useState('');
  const [owner, setOwner] = useState('');
  const [classificationLevel, setClassificationLevel] = useState('Unclassified');

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', fileDescription);
    formData.append('isPublic', isPublic.toString());
    formData.append('document_type', documentType);
    formData.append('document_date', documentDate);
    formData.append('department', department);
    formData.append('owner', owner);
    formData.append('classification_level', classificationLevel);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`File "${selectedFile.name}" uploaded successfully!`);
        
        // Reset form
        setSelectedFile(null);
        setFileDescription('');
        setIsPublic(false);
        setDocumentType('');
        setDocumentDate('');
        setDepartment('');
        setOwner('');
        setClassificationLevel('Unclassified');
        
        // Redirect to My Files
        navigate('/my-files');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <h1>Upload Document</h1>
      
      <form className="upload-form" onSubmit={handleUpload}>
      
        <div className="form-group">
          <label>Select File *</label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            required
          />
        </div>
        
  
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            placeholder="Describe this document..."
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Document Type</label>
            <select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="">Select type...</option>
              <option value="Report">Report</option>
              <option value="Memo">Memo</option>
              <option value="Contract">Contract</option>
              <option value="Invoice">Invoice</option>
              <option value="Certificate">Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Document Date</label>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Finance, HR, IT"
            />
          </div>
          
          <div className="form-group">
            <label>Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Document owner"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Classification Level</label>
          <select 
            value={classificationLevel} 
            onChange={(e) => setClassificationLevel(e.target.value)}
          >
            <option value="Unclassified">Unclassified</option>
            <option value="Confidential">Confidential</option>
            <option value="Secret">Secret</option>
            <option value="Top Secret">Top Secret</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make this file public
          </label>
        </div>
        
        <button type="submit" disabled={uploading || !selectedFile}>
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};*/






import { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  
  // Document metadata state
  const [fileDescription, setFileDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [department, setDepartment] = useState("");
  const [owner, setOwner] = useState("");
  const [classificationLevel, setClassificationLevel] = useState("Unclassified");
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Predefined options
  const documentTypes = [
    "", // Empty option
    "Report", "Memo", "Contract", "Invoice", "Certificate", 
    "Policy", "Procedure", "Form", "Presentation", "Spreadsheet",
    "Image", "Video", "Audio", "Email", "Other"
  ];
  
  const departments = [
    "", // Empty option
    "Administration", "Finance", "Human Resources", "IT", "Legal",
    "Marketing", "Operations", "Procurement", "Sales", "Research & Development"
  ];
  
  const classificationLevels = [
    "Unclassified",
    "Confidential", 
    "Secret", 
    "Top Secret"
  ];
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setUploadError("File size must be less than 50MB");
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setUploadError("");
      
      // Auto-set some metadata based on filename
      const fileName = file.name.toLowerCase();
      if (fileName.includes("report") || fileName.includes("analysis")) {
        setDocumentType("Report");
      } else if (fileName.includes("invoice") || fileName.includes("bill")) {
        setDocumentType("Invoice");
      } else if (fileName.includes("contract") || fileName.includes("agreement")) {
        setDocumentType("Contract");
      } else if (fileName.includes("image") || fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
        setDocumentType("Image");
      } else if (fileName.includes("video") || fileName.match(/\.(mp4|avi|mov)$/)) {
        setDocumentType("Video");
      } else if (fileName.includes("audio") || fileName.match(/\.(mp3|wav)$/)) {
        setDocumentType("Audio");
      } else if (fileName.includes("spreadsheet") || fileName.match(/\.(xls|xlsx)$/)) {
        setDocumentType("Spreadsheet");
      } else if (fileName.includes("presentation") || fileName.match(/\.(ppt|pptx)$/)) {
        setDocumentType("Presentation");
      }
      
      // Auto-set owner to current user's name
      if (user?.name) {
        setOwner(user.name);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    // Reset states
    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess(false);
    setUploadResponse(null);
    setDebugInfo(null);

    // Create FormData
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', fileDescription);
    formData.append('isPublic', isPublic.toString());
    formData.append('document_type', documentType);
    formData.append('document_date', documentDate);
    formData.append('department', department);
    formData.append('owner', owner);
    formData.append('classification_level', classificationLevel);

    // Debug: Show what's being sent
    console.log("📤 Uploading file:", selectedFile.name);
    console.log("📝 Form data:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // Simulate progress (optional)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const token = localStorage.getItem('token');
      
      // **CRITICAL FIX: Changed endpoint from /api/upload to /api/files/upload**
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type for FormData, browser sets it automatically
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("📨 Upload response status:", response.status);
      console.log("📨 Upload response headers:", Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log("📨 Upload response text:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 200)}`);
      }
      
      setUploadResponse(result);
      console.log("📦 Upload parsed result:", result);
      
      if (response.ok && result.success) {
        setUploadSuccess(true);
        setDebugInfo({
          fileId: result.data?.file?.id,
          downloadUrl: result.data?.downloadUrl,
          timestamp: new Date().toISOString()
        });
        
        // Reset form after successful upload
        setTimeout(() => {
          resetForm();
          navigate('/my-files');
        }, 3000);
      } else {
        // Handle server error response
        console.error("❌ Server error response:", result);
        throw new Error(result.message || result.error || `Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      setUploadError(error.message || "Upload failed. Please try again.");
      
      // Store debug info for troubleshooting
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
        fileSize: selectedFile?.size,
        fileName: selectedFile?.name
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileDescription("");
    setIsPublic(false);
    setDocumentType("");
    setDocumentDate("");
    setDepartment("");
    setOwner(user?.name || "");
    setClassificationLevel("Unclassified");
    setUploadError("");
    setUploadSuccess(false);
    setUploadResponse(null);
    setDebugInfo(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/debug/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      console.log("🔧 API Test Result:", result);
      alert(`API Test: ${result.success ? '✅ Success' : '❌ Failed'}\n${result.message}`);
    } catch (error) {
      console.error("🔧 API Test Error:", error);
      alert(`API Test Failed: ${error.message}`);
    }
  };

  // Test upload with dummy data
  const testUpload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/test-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log("🧪 Test Upload Result:", result);
      alert(`Test Upload: ${result.success ? '✅ Success' : '❌ Failed'}\nFile ID: ${result.file?.id}`);
    } catch (error) {
      console.error("🧪 Test Upload Error:", error);
      alert(`Test Upload Failed: ${error.message}`);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Upload Document</h1>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={testApiConnection}
            className="debug-btn"
            title="Test API Connection"
          >
            🔧 Test API
          </button>
          <button 
            type="button" 
            onClick={testUpload}
            className="debug-btn"
            title="Test Upload Without File"
          >
            🧪 Test Upload
          </button>
        </div>
      </div>
      
      {/* Success Message */}
      {uploadSuccess && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-icon">✅</span>
            <div>
              <h3>File uploaded successfully!</h3>
              <p>File ID: {debugInfo?.fileId}</p>
              <p>Redirecting to My Files in 3 seconds...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {uploadError && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">❌</span>
            <div>
              <h3>Upload Failed</h3>
              <p>{uploadError}</p>
              {debugInfo && (
                <details className="debug-details">
                  <summary>Debug Info</summary>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </details>
              )}
              {uploadResponse && (
                <details className="debug-details">
                  <summary>Server Response</summary>
                  <pre>{JSON.stringify(uploadResponse, null, 2)}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
      
      <form className="upload-form" onSubmit={handleUpload}>
        {/* File Selection Section */}
        <div className="upload-section">
          <h3>1. Select File</h3>
          
          <div className="file-input-area" onClick={triggerFileInput}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
              <div className="file-selected">
                <div className="file-icon">
                  {selectedFile.type.startsWith('image/') ? '🖼️' : 
                   selectedFile.type.includes('pdf') ? '📄' :
                   selectedFile.type.includes('video') ? '🎬' :
                   selectedFile.type.includes('audio') ? '🎵' : 
                   selectedFile.type.includes('spreadsheet') ? '📊' :
                   selectedFile.type.includes('presentation') ? '📽️' : '📁'}
                </div>
                <div className="file-details">
                  <h4>{selectedFile.name}</h4>
                  <p>Size: {formatFileSize(selectedFile.size)}</p>
                  <p>Type: {selectedFile.type || "Unknown"}</p>
                  <p className="file-mime">MIME: {selectedFile.type}</p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="file-placeholder">
                <div className="upload-icon">📤</div>
                <p>Click to select a file</p>
                <small>Max file size: 50MB</small>
                <small>Drag & drop supported</small>
              </div>
            )}
          </div>
          
          <div className="file-types-info">
            <small>Supported formats: PDF, Word, Excel, PowerPoint, Images, Videos, Audio, Text</small>
          </div>
        </div>
        
        {/* Document Metadata Section */}
        <div className="upload-section">
          <h3>2. Document Information</h3>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Describe this document..."
              rows="3"
              required
            />
            <small className="hint">Required field</small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Document Type *</label>
              <select 
                value={documentType} 
                onChange={(e) => setDocumentType(e.target.value)}
                required
              >
                <option value="">Select document type...</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <small className="hint">Required field</small>
            </div>
            
            <div className="form-group">
              <label>Document Date</label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <small className="hint">Optional</small>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select department...</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <small className="hint">Optional</small>
            </div>
            
            <div className="form-group">
              <label>Owner *</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Document owner"
                required
              />
              <small className="hint">Required field</small>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Classification Level *</label>
              <select 
                value={classificationLevel} 
                onChange={(e) => setClassificationLevel(e.target.value)}
                required
              >
                {classificationLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <small className="hint">Required field</small>
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  Make this file public
                </label>
                <small className="checkbox-hint">
                  Public files can be accessed by other users
                </small>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upload Progress Bar */}
        {uploading && (
          <div className="upload-section">
            <h3>3. Upload Progress</h3>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              </div>
              <p className="progress-status">
                {uploadProgress < 100 ? "Uploading..." : "Processing..."}
              </p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetForm}
            className="secondary-btn"
            disabled={uploading}
          >
            Clear Form
          </button>
          
          <button 
            type="submit" 
            disabled={uploading || !selectedFile}
            className="primary-btn"
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
        
        {/* User Info */}
        <div className="user-upload-info">
          <div className="user-info-card">
            <h4>Upload Information</h4>
            <p><strong>User:</strong> {user?.name} ({user?.email})</p>
            <p><strong>User ID:</strong> {user?.id || user?.userId || "N/A"}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            <p><strong>Token Present:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
        
        {/* Debug Info (visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="debug-section">
            <summary>Debug Information</summary>
            <div className="debug-content">
              <h4>Form Data:</h4>
              <ul>
                <li>File: {selectedFile?.name || 'None'}</li>
                <li>Description: {fileDescription || 'Empty'}</li>
                <li>Document Type: {documentType || 'Not set'}</li>
                <li>Department: {department || 'Not set'}</li>
                <li>Owner: {owner || 'Not set'}</li>
                <li>Classification: {classificationLevel}</li>
                <li>Public: {isPublic ? 'Yes' : 'No'}</li>
              </ul>
              <h4>User Context:</h4>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </details>
        )}
      </form>
    </div>
  );
};

export default Upload;