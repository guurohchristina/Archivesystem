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
        {/* TODO: Display list of uploaded files */}
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

export default Upload;