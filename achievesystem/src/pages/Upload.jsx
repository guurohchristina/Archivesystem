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




/*fal back

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
      const response = await fetch('/api/upload', {
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
        
      
        <div className="user-upload-info">
          <div className="user-info-card">
            <h4>Upload Information</h4>
            <p><strong>User:</strong> {user?.name} ({user?.email})</p>
            <p><strong>User ID:</strong> {user?.id || user?.userId || "N/A"}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            <p><strong>Token Present:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
      
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

export default Upload;*/





import { useState, useContext, useRef, useEffect } from "react";
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
  const [debugInfo, setDebugInfo] = useState(null);
  
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

  // Debug on component mount
  useEffect(() => {
    console.log("=== UPLOAD COMPONENT MOUNTED ===");
    console.log("User from context:", user);
    console.log("Token exists:", !!localStorage.getItem("token"));
    console.log("API URL would be:", process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/upload' 
      : '/api/upload');
  }, []);

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

    console.log('📤 === FRONTEND UPLOAD DEBUG START ===');
    console.log('Selected file:', selectedFile.name, selectedFile.size, 'bytes');
    console.log('File type:', selectedFile.type);
    
    // Show FormData contents
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
    }

    // Simulate progress
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
      console.log('🔑 Token exists:', !!token);
      if (token) {
        console.log('Token first 30 chars:', token.substring(0, 30) + '...');
      }

      // Check if user is logged in
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Use absolute URL in development
      const API_URL = 'http://localhost:3000' ;
    
      
      console.log('🌐 Making request to:', `${API_URL}/api/upload`);
      
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // DO NOT set Content-Type for FormData - browser sets it automatically
        },
        credentials: 'include',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      console.log('📨 Response headers:');
      for (let [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      // Get response as TEXT first
      const responseText = await response.text();
      console.log('📨 Raw response length:', responseText.length, 'characters');
      console.log('📨 First 500 chars of response:', responseText.substring(0, 500));

      // Check if it's HTML
      const isHtml = responseText.includes('<!DOCTYPE') || 
                     responseText.includes('<html') || 
                     responseText.trim().startsWith('<') ||
                     responseText.includes('</html>');
      
      if (isHtml) {
        console.error('❌ SERVER RETURNED HTML ERROR PAGE!');
        console.error('HTML preview:', responseText.substring(0, 500));
        
        // Try to extract error message from HTML
        const errorMatch = responseText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i) ||
                          responseText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                          responseText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        
        const errorMessage = errorMatch ? errorMatch[1] : 'Server returned HTML error page';
        throw new Error(errorMessage);
      }

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ JSON parsed successfully');
        console.log('Result:', result);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
        console.error('Response that failed to parse:', responseText.substring(0, 200));
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      setUploadResponse(result);
      
      if (response.ok && result.success) {
        console.log('✅ Upload successful!');
        setUploadSuccess(true);
        setDebugInfo({
          fileId: result.data?.file?.id,
          downloadUrl: result.data?.downloadUrl,
          timestamp: new Date().toISOString()
        });
        
        // Success - redirect after delay
        setTimeout(() => {
          resetForm();
          navigate('/my-files');
        }, 2000);
      } else {
        // Server returned error in JSON format
        console.error('❌ Server error response:', result);
        throw new Error(result.message || result.error || `Upload failed with status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadError(error.message || "Upload failed. Please try again.");
      
      // Store debug info
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
        fileSize: selectedFile?.size,
        fileName: selectedFile?.name,
        user: user
      });
    } finally {
      console.log('🏁 === FRONTEND UPLOAD DEBUG END ===');
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

  // =========== DEBUG FUNCTIONS ===========

  const testServerConnection = async () => {
    try {
      console.log("🔧 Testing server connection...");
      
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : '';
      
      // Test health endpoint
      const healthResponse = await fetch(`${API_URL}/health`);
      const healthText = await healthResponse.text();
      console.log("Health check:", healthText);
      
      // Test upload test endpoint
      const uploadTestResponse = await fetch(`${API_URL}/api/upload/test`);
      const uploadTestText = await uploadTestResponse.text();
      console.log("Upload test:", uploadTestText);
      
      alert(`Server tests:\nHealth: ${healthResponse.status}\nUpload test: ${uploadTestResponse.status}`);
      
    } catch (error) {
      console.error("Server test error:", error);
      alert(`Server test failed: ${error.message}`);
    }
  };

  const testAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("🔐 Testing auth status...");
      console.log("Token:", token ? "Present" : "Missing");
      
      if (!token) {
        alert("❌ No token found. Please login.");
        return;
      }
      
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : '';
      
      // Test profile endpoint
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const text = await response.text();
      console.log("Profile response:", text);
      
      try {
        const json = JSON.parse(text);
        alert(`Auth test: ${json.success ? '✅ Success' : '❌ Failed'}\nUser: ${json.user?.email}`);
      } catch {
        alert(`Auth returned non-JSON:\n${text.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.error("Auth test error:", error);
      alert(`Auth test failed: ${error.message}`);
    }
  };

  const testUploadWithoutFile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("❌ No token found");
        return;
      }
      
      const formData = new FormData();
      formData.append('description', 'Test without file');
      formData.append('owner', 'Test User');
      
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : '';
      
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const text = await response.text();
      console.log("Upload without file response:", text);
      
      try {
        const json = JSON.parse(text);
        alert(`Test: ${json.success ? '✅ Success' : '❌ Failed'}\nMessage: ${json.message}`);
      } catch {
        alert(`Response was non-JSON:\n${text.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.error("Test error:", error);
      alert(`Test failed: ${error.message}`);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('token');
    alert("Token cleared. Please refresh and login again.");
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Upload Document</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={testServerConnection}
            className="debug-btn"
            title="Test Server Connection"
            style={{ padding: '8px 12px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            🔧 Server Test
          </button>
          <button 
            type="button" 
            onClick={testAuthStatus}
            className="debug-btn"
            title="Test Authentication"
            style={{ padding: '8px 12px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            🔐 Auth Test
          </button>
          <button 
            type="button" 
            onClick={testUploadWithoutFile}
            className="debug-btn"
            title="Test Upload Without File"
            style={{ padding: '8px 12px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            📤 Test Upload
          </button>
          <button 
            type="button" 
            onClick={clearLocalStorage}
            className="debug-btn"
            title="Clear Token"
            style={{ padding: '8px 12px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px', color: '#c62828' }}
          >
            🗑️ Clear Token
          </button>
        </div>
      </div>
      
      {/* Success Message */}
      {uploadSuccess && (
        <div className="success-message" style={{ 
          background: '#d4edda', 
          border: '1px solid #c3e6cb', 
          color: '#155724', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>File uploaded successfully!</h3>
              <p style={{ margin: '0' }}>Redirecting to My Files in 2 seconds...</p>
              {debugInfo?.fileId && <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>File ID: {debugInfo.fileId}</p>}
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {uploadError && (
        <div className="error-message" style={{ 
          background: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>❌</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Upload Failed</h3>
              <p style={{ margin: '0 0 10px 0' }}>{uploadError}</p>
              
              {debugInfo && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#856404' }}>
                    Debug Information
                  </summary>
                  <pre style={{ 
                    background: '#fff3cd', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    overflow: 'auto',
                    marginTop: '10px'
                  }}>
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
              
              {uploadResponse && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#856404' }}>
                    Server Response
                  </summary>
                  <pre style={{ 
                    background: '#fff3cd', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    overflow: 'auto',
                    marginTop: '10px'
                  }}>
                    {JSON.stringify(uploadResponse, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
      
      <form className="upload-form" onSubmit={handleUpload} style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* File Selection Section */}
        <div className="upload-section" style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ marginTop: '0' }}>1. Select File</h3>
          
          <div 
            className="file-input-area" 
            onClick={triggerFileInput}
            style={{ 
              border: '2px dashed #ccc', 
              borderRadius: '8px', 
              padding: '40px 20px', 
              textAlign: 'center', 
              cursor: 'pointer',
              transition: 'border-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#007bff'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
              style={{ display: 'none' }}
            />
            
            {selectedFile ? (
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
          </div>
          
          <div className="file-types-info" style={{ marginTop: '10px', textAlign: 'center' }}>
            <small style={{ color: '#666' }}>Supported formats: PDF, Word, Excel, PowerPoint, Images, Videos, Audio, Text</small>
          </div>
        </div>
        
        {/* Document Metadata Section */}
        <div className="upload-section" style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ marginTop: '0' }}>2. Document Information</h3>
          
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description *</label>
            <textarea
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Describe this document..."
              rows="3"
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Required field</small>
          </div>
          
          <div className="form-row" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Document Type *</label>
              <select 
                value={documentType} 
                onChange={(e) => setDocumentType(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                <option value="">Select document type...</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Required field</small>
            </div>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Document Date</label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px'
                }}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Optional</small>
            </div>
          </div>
          
          <div className="form-row" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                <option value="">Select department...</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Optional</small>
            </div>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Owner *</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Document owner"
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px'
                }}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Required field</small>
            </div>
          </div>
          
          <div className="form-row" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px'
          }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Classification Level *</label>
              <select 
                value={classificationLevel} 
                onChange={(e) => setClassificationLevel(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                {classificationLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Required field</small>
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="checkbox-input"
                    style={{ marginRight: '10px' }}
                  />
                  Make this file public
                </label>
                <small className="checkbox-hint" style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Public files can be accessed by other users
                </small>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upload Progress Bar */}
        {uploading && (
          <div className="upload-section" style={{ 
            background: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ marginTop: '0' }}>3. Upload Progress</h3>
            <div className="progress-container">
              <div className="progress-bar" style={{ 
                height: '30px', 
                background: '#e9ecef', 
                borderRadius: '4px', 
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    height: '100%', 
                    background: '#007bff', 
                    transition: 'width 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              </div>
              <p className="progress-status" style={{ textAlign: 'center', margin: 0 }}>
                {uploadProgress < 100 ? "Uploading..." : "Processing..."}
              </p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="form-actions" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '30px' 
        }}>
          <button 
            type="button" 
            onClick={resetForm}
            className="secondary-btn"
            disabled={uploading}
            style={{ 
              padding: '12px 24px', 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              opacity: uploading ? 0.5 : 1
            }}
          >
            Clear Form
          </button>
          
          <button 
            type="submit" 
            disabled={uploading || !selectedFile}
            className="primary-btn"
            style={{ 
              padding: '12px 24px', 
              background: uploading ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {uploading ? (
              <>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Uploading...
              </>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
        
        {/* User Info */}
        <div className="user-upload-info" style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#e8f4fd', 
          borderRadius: '8px',
          borderLeft: '4px solid #007bff'
        }}>
          <h4 style={{ marginTop: '0' }}>Upload Information</h4>
          <p><strong>User:</strong> {user?.name || 'Unknown'} ({user?.email || 'No email'})</p>
          <p><strong>User ID:</strong> {user?.id || user?.userId || "N/A"}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          <p><strong>Token Present:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}</p>
          {localStorage.getItem('token') && (
            <p><strong>Token Preview:</strong> {localStorage.getItem('token').substring(0, 30)}...</p>
          )}
        </div>
        
        {/* Debug Info (visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="debug-section" style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f8f9fa', 
            border: '1px solid #dee2e6', 
            borderRadius: '4px' 
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#495057' }}>
              Debug Information (Development Only)
            </summary>
            <div className="debug-content" style={{ marginTop: '10px' }}>
              <h4 style={{ marginTop: '0' }}>Form Data:</h4>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>File: {selectedFile?.name || 'None'}</li>
                <li>Description: {fileDescription || 'Empty'}</li>
                <li>Document Type: {documentType || 'Not set'}</li>
                <li>Department: {department || 'Not set'}</li>
                <li>Owner: {owner || 'Not set'}</li>
                <li>Classification: {classificationLevel}</li>
                <li>Public: {isPublic ? 'Yes' : 'No'}</li>
              </ul>
              <h4>User Context:</h4>
              <pre style={{ 
                background: '#e9ecef', 
                padding: '10px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                overflow: 'auto' 
              }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </form>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .debug-btn:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default Upload;