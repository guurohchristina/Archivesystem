import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const SystemSettings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    // Archive Settings
    systemName: "Digital Archive System",
    archiveDescription: "Central repository for digital preservation",
    
    // Preservation Settings
    retentionPolicy: "permanent", // permanent, years, months
    retentionPeriod: 10, // years if retentionPolicy is years
    autoBackupEnabled: true,
    backupFrequency: "weekly", // daily, weekly, monthly
    checksumVerification: true,
    formatMigrationEnabled: false,
    
    // Access & Security
    publicAccessEnabled: false,
    accessTier: "restricted", // open, restricted, confidential
    watermarkDocuments: true,
    encryptionLevel: "standard", // standard, high, military
    twoFactorRequired: false,
    
    // Storage & Quotas
    maxFileSize: 500, // in MB
    allowedFormats: ['.pdf', '.tiff', '.jpg', '.png', '.docx', '.xlsx'],
    preservationFormats: ['.pdf/a', '.tiff', '.xml'],
    defaultStorageQuota: 1024, // in MB per user
    
    // Metadata & Indexing
    mandatoryMetadata: ['title', 'creator', 'date', 'description'],
    autoIndexing: true,
    fullTextSearch: true,
    
    // System
    maintenanceMode: false,
    auditLogRetention: 365, // days
    versioningEnabled: true,
    
    // Notification Settings
    notifyOnUpload: true,
    notifyOnDeletion: true,
    notifyAdminsOnQuota: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [activeTab, setActiveTab] = useState("preservation");
  
  const API_BASE = 'https://archivesystembackend.onrender.com';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching archive settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleArrayChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setSettings(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleSaveSettings = async () => {
    if (user?.role !== 'admin') {
      setSaveStatus("❌ Admin access required");
      return;
    }
    
    setLoading(true);
    setSaveStatus("Saving archive settings...");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSaveStatus("✅ Archive settings saved successfully!");
          setTimeout(() => setSaveStatus(""), 3000);
        } else {
          setSaveStatus("❌ Failed to save settings");
        }
      } else {
        setSaveStatus("❌ Server error occurred");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("❌ Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Reset all archive settings to default values? This cannot be undone.")) {
      setSettings({
        systemName: "Digital Archive System",
        archiveDescription: "Central repository for digital preservation",
        retentionPolicy: "permanent",
        retentionPeriod: 10,
        autoBackupEnabled: true,
        backupFrequency: "weekly",
        checksumVerification: true,
        formatMigrationEnabled: false,
        publicAccessEnabled: false,
        accessTier: "restricted",
        watermarkDocuments: true,
        encryptionLevel: "standard",
        twoFactorRequired: false,
        maxFileSize: 500,
        allowedFormats: ['.pdf', '.tiff', '.jpg', '.png', '.docx', '.xlsx'],
        preservationFormats: ['.pdf/a', '.tiff', '.xml'],
        defaultStorageQuota: 1024,
        mandatoryMetadata: ['title', 'creator', 'date', 'description'],
        autoIndexing: true,
        fullTextSearch: true,
        maintenanceMode: false,
        auditLogRetention: 365,
        versioningEnabled: true,
        notifyOnUpload: true,
        notifyOnDeletion: true,
        notifyAdminsOnQuota: true
      });
      setSaveStatus("Settings reset to archival defaults");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  const renderPreservationTab = () => (
    <div className="settings-section">
      <h3>Digital Preservation</h3>
      
      <div className="setting-item">
        <label>Retention Policy</label>
        <select name="retentionPolicy" value={settings.retentionPolicy} onChange={handleInputChange}>
          <option value="permanent">Permanent Archive</option>
          <option value="years">Retain for Years</option>
          <option value="months">Retain for Months</option>
          <option value="disposable">Disposable (Temporary)</option>
        </select>
        {settings.retentionPolicy !== 'permanent' && (
          <div style={{marginTop: '10px'}}>
            <label>Retention Period ({settings.retentionPolicy === 'years' ? 'Years' : 'Months'})</label>
            <input type="number" name="retentionPeriod" value={settings.retentionPeriod} onChange={handleInputChange} min="1" max={settings.retentionPolicy === 'years' ? 100 : 1200} />
          </div>
        )}
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="autoBackupEnabled" checked={settings.autoBackupEnabled} onChange={handleInputChange} />
          <span>Enable Automated Backups</span>
        </label>
        {settings.autoBackupEnabled && (
          <div style={{marginLeft: '28px', marginTop: '10px'}}>
            <label>Backup Frequency</label>
            <select name="backupFrequency" value={settings.backupFrequency} onChange={handleInputChange}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="checksumVerification" checked={settings.checksumVerification} onChange={handleInputChange} />
          <span>Checksum Verification</span>
        </label>
        <p className="setting-description">Verify file integrity on every access</p>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="formatMigrationEnabled" checked={settings.formatMigrationEnabled} onChange={handleInputChange} />
          <span>Format Migration</span>
        </label>
        <p className="setting-description">Automatically migrate files to preservation formats</p>
      </div>

      <div className="setting-item">
        <label>Preservation Formats</label>
        <input 
          type="text" 
          value={settings.preservationFormats.join(', ')} 
          onChange={(e) => handleArrayChange('preservationFormats', e.target.value)}
          placeholder=".pdf/a, .tiff, .xml"
        />
        <p className="setting-description">Formats for long-term preservation</p>
      </div>
    </div>
  );

  const renderAccessTab = () => (
    <div className="settings-section">
      <h3>Access & Security</h3>
      
      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="publicAccessEnabled" checked={settings.publicAccessEnabled} onChange={handleInputChange} />
          <span>Enable Public Access</span>
        </label>
        <p className="setting-description">Allow public viewing of published archives</p>
      </div>

      <div className="setting-item">
        <label>Access Tier</label>
        <select name="accessTier" value={settings.accessTier} onChange={handleInputChange}>
          <option value="open">Open Access</option>
          <option value="restricted">Restricted (Registered Users)</option>
          <option value="confidential">Confidential (Admin Only)</option>
        </select>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="watermarkDocuments" checked={settings.watermarkDocuments} onChange={handleInputChange} />
          <span>Apply Watermarks to Documents</span>
        </label>
      </div>

      <div className="setting-item">
        <label>Encryption Level</label>
        <select name="encryptionLevel" value={settings.encryptionLevel} onChange={handleInputChange}>
          <option value="standard">Standard (AES-256)</option>
          <option value="high">High (Military Grade)</option>
          <option value="custom">Custom Encryption</option>
        </select>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="twoFactorRequired" checked={settings.twoFactorRequired} onChange={handleInputChange} />
          <span>Require Two-Factor Authentication</span>
        </label>
        <p className="setting-description">For all administrative access</p>
      </div>
    </div>
  );

  const renderStorageTab = () => (
    <div className="settings-section">
      <h3>Storage & Metadata</h3>
      
      <div className="setting-item">
        <label>Maximum File Size (MB)</label>
        <input type="number" name="maxFileSize" value={settings.maxFileSize} onChange={handleInputChange} min="1" max="10240" />
      </div>

      <div className="setting-item">
        <label>Allowed Upload Formats</label>
        <input 
          type="text" 
          value={settings.allowedFormats.join(', ')} 
          onChange={(e) => handleArrayChange('allowedFormats', e.target.value)}
          placeholder=".pdf, .tiff, .jpg, .docx"
        />
      </div>

      <div className="setting-item">
        <label>Default Storage Quota per User (MB)</label>
        <input type="number" name="defaultStorageQuota" value={settings.defaultStorageQuota} onChange={handleInputChange} min="10" max="102400" />
      </div>

      <div className="setting-item">
        <label>Mandatory Metadata Fields</label>
        <input 
          type="text" 
          value={settings.mandatoryMetadata.join(', ')} 
          onChange={(e) => handleArrayChange('mandatoryMetadata', e.target.value)}
          placeholder="title, creator, date, description"
        />
        <p className="setting-description">Required fields for all archive entries</p>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="autoIndexing" checked={settings.autoIndexing} onChange={handleInputChange} />
          <span>Automatic Indexing</span>
        </label>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="fullTextSearch" checked={settings.fullTextSearch} onChange={handleInputChange} />
          <span>Full-Text Search</span>
        </label>
        <p className="setting-description">Enable search within document contents</p>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="versioningEnabled" checked={settings.versioningEnabled} onChange={handleInputChange} />
          <span>Document Versioning</span>
        </label>
        <p className="setting-description">Keep version history of all documents</p>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="settings-section">
      <h3>System Configuration</h3>
      
      <div className="setting-item">
        <label>Archive System Name</label>
        <input type="text" name="systemName" value={settings.systemName} onChange={handleInputChange} />
      </div>

      <div className="setting-item">
        <label>Archive Description</label>
        <textarea name="archiveDescription" value={settings.archiveDescription} onChange={handleInputChange} rows="3" />
      </div>

      <div className="setting-item">
        <label>Audit Log Retention (Days)</label>
        <input type="number" name="auditLogRetention" value={settings.auditLogRetention} onChange={handleInputChange} min="30" max="3650" />
        <p className="setting-description">How long to keep system audit logs</p>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleInputChange} />
          <span style={{color: settings.maintenanceMode ? '#dc3545' : 'inherit'}}>
            Maintenance Mode
          </span>
        </label>
        <p className="setting-description">Take system offline for maintenance</p>
      </div>

      <h4 style={{marginTop: '25px', marginBottom: '15px'}}>Notification Settings</h4>
      
      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="notifyOnUpload" checked={settings.notifyOnUpload} onChange={handleInputChange} />
          <span>Notify on File Upload</span>
        </label>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="notifyOnDeletion" checked={settings.notifyOnDeletion} onChange={handleInputChange} />
          <span>Notify on File Deletion</span>
        </label>
      </div>

      <div className="setting-item">
        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <input type="checkbox" name="notifyAdminsOnQuota" checked={settings.notifyAdminsOnQuota} onChange={handleInputChange} />
          <span>Notify Admins on Quota Exceeded</span>
        </label>
      </div>
    </div>
  );

  if (loading && user?.role === 'admin') {
    return (
      <div className="page" style={{padding: '40px', textAlign: 'center'}}>
        <div className="loading-spinner"></div>
        <p>Loading archive settings...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{padding: '20px', maxWidth: '1000px', margin: '0 auto'}}>
      <div className="page-header" style={{marginBottom: '30px'}}>
        <h1>Archive System Settings</h1>
        <p style={{color: '#666', marginTop: '5px'}}>Configure digital preservation and archival policies</p>
      </div>

      {user?.role !== 'admin' ? (
        <div className="admin-warning">
          <h3>⚠️ Archivist Access Required</h3>
          <p>Only archivists and system administrators can modify preservation settings.</p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="settings-tabs" style={{
            display: 'flex', 
            borderBottom: '1px solid #ddd',
            marginBottom: '30px',
            gap: '10px'
          }}>
            {['preservation', 'access', 'storage', 'system'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  background: activeTab === tab ? '#007bff' : 'transparent',
                  color: activeTab === tab ? 'white' : '#666',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #0056b3' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: activeTab === tab ? '600' : '400'
                }}
              >
                {tab === 'preservation' ? 'Digital Preservation' :
                 tab === 'access' ? 'Access & Security' :
                 tab === 'storage' ? 'Storage & Metadata' : 'System'}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="tab-content">
            {activeTab === 'preservation' && renderPreservationTab()}
            {activeTab === 'access' && renderAccessTab()}
            {activeTab === 'storage' && renderStorageTab()}
            {activeTab === 'system' && renderSystemTab()}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons" style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div className="status-message">
              {saveStatus && (
                <span style={{
                  padding: '10px 15px',
                  borderRadius: '4px',
                  backgroundColor: saveStatus.includes('✅') ? '#d4edda' : '#f8d7da',
                  color: saveStatus.includes('✅') ? '#155724' : '#721c24',
                  fontWeight: '500'
                }}>
                  {saveStatus}
                </span>
              )}
            </div>

            <div className="buttons" style={{display: 'flex', gap: '15px'}}>
              <button
                onClick={handleResetToDefaults}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Reset to Defaults
              </button>
              
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontWeight: '600'
                }}
              >
                {loading ? 'Saving...' : 'Save Archive Settings'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add some CSS for better styling */}
    <style>{`
        .settings-section {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }
        
        .settings-section h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .setting-item {
          margin-bottom: 25px;
        }
        
        .setting-item label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #34495e;
        }
        
        .setting-item input[type="text"],
        .setting-item input[type="number"],
        .setting-item select,
        .setting-item textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 15px;
          transition: border-color 0.2s;
        }
        
        .setting-item input:focus,
        .setting-item select:focus,
        .setting-item textarea:focus {
          outline: none;
          border-color: #007bff;
        }
        
        .setting-description {
          margin: 6px 0 0 0;
          color: #7f8c8d;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .admin-warning p {
          color: #856404;
          margin: 0;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}</style>
    </div>
  );
};

export default SystemSettings;

      