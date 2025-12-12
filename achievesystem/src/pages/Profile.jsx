import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "General",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert("Profile updated successfully!");
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "General",
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setLoading(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion functionality will be implemented here.");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#ea4335';
      case 'user': return '#34a853';
      case 'manager': return '#fbbc04';
      default: return '#5f6368';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '👑';
      case 'user': return '👤';
      case 'manager': return '📋';
      default: return '👤';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Account Settings</h1>
        <p style={styles.subtitle}>Manage your profile and account preferences</p>
      </div>

      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.userInfoCard}>
            <div style={styles.userAvatar}>
              <span style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div style={styles.userDetails}>
              <h3 style={styles.userName}>{user?.name || "User"}</h3>
              <p style={styles.userEmail}>{user?.email || ""}</p>
              <div style={{
                ...styles.roleBadge,
                backgroundColor: getRoleBadgeColor(user?.role)
              }}>
                <span style={{ marginRight: '6px' }}>{getRoleIcon(user?.role)}</span>
                {user?.role || "User"}
              </div>
            </div>
          </div>

          <nav style={styles.nav}>
            <button
              style={{
                ...styles.navButton,
                backgroundColor: activeTab === "profile" ? "#e8f0fe" : "transparent",
                color: activeTab === "profile" ? "#4285F4" : "#5f6368",
              }}
              onClick={() => setActiveTab("profile")}
            >
              <span style={styles.navIcon}>👤</span>
              Profile
            </button>
            <button
              style={{
                ...styles.navButton,
                backgroundColor: activeTab === "security" ? "#e8f0fe" : "transparent",
                color: activeTab === "security" ? "#4285F4" : "#5f6368",
              }}
              onClick={() => setActiveTab("security")}
            >
              <span style={styles.navIcon}>🔒</span>
              Security
            </button>
            <button
              style={{
                ...styles.navButton,
                backgroundColor: activeTab === "preferences" ? "#e8f0fe" : "transparent",
                color: activeTab === "preferences" ? "#4285F4" : "#5f6368",
              }}
              onClick={() => setActiveTab("preferences")}
            >
              <span style={styles.navIcon}>⚙️</span>
              Preferences
            </button>
            <button
              style={{
                ...styles.navButton,
                backgroundColor: activeTab === "danger" ? "#fce8e6" : "transparent",
                color: activeTab === "danger" ? "#ea4335" : "#5f6368",
              }}
              onClick={() => setActiveTab("danger")}
            >
              <span style={styles.navIcon}>⚠️</span>
              Danger Zone
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          {activeTab === "profile" && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={styles.editButton}
                  >
                    <span style={{ marginRight: '6px' }}>✏️</span>
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div style={styles.profileInfo}>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>Full Name</label>
                      <div style={styles.infoValue}>{user?.name || "Not set"}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>Email Address</label>
                      <div style={styles.infoValue}>{user?.email || "Not set"}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>Phone Number</label>
                      <div style={styles.infoValue}>{user?.phone || "Not provided"}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>Department</label>
                      <div style={styles.infoValue}>{user?.department || "General"}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>User ID</label>
                      <div style={styles.infoValue}>{user?.id || "N/A"}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <label style={styles.infoLabel}>Account Created</label>
                      <div style={styles.infoValue}>{formatDate(user?.created_at)}</div>
                    </div>
                  </div>

                  <div style={styles.statsSection}>
                    <h3 style={styles.statsTitle}>Account Statistics</h3>
                    <div style={styles.statsGrid}>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>📁</div>
                        <div style={styles.statContent}>
                          <div style={styles.statNumber}>0</div>
                          <div style={styles.statLabel}>Files Uploaded</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>🔗</div>
                        <div style={styles.statContent}>
                          <div style={styles.statNumber}>0</div>
                          <div style={styles.statLabel}>Files Shared</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>📊</div>
                        <div style={styles.statContent}>
                          <div style={styles.statNumber}>0 MB</div>
                          <div style={styles.statLabel}>Storage Used</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.editForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      style={styles.formInput}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Email Address *</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      style={styles.formInput}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      style={styles.formInput}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Department</label>
                    <select
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                      style={styles.formInput}
                    >
                      <option value="General">General</option>
                      <option value="IT">IT Department</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div style={styles.formActions}>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      style={loading ? styles.saveButtonLoading : styles.saveButton}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div style={styles.tabContent}>
              <h2 style={styles.tabTitle}>Security Settings</h2>
              
              <div style={styles.securitySection}>
                <h3 style={styles.sectionTitle}>Change Password</h3>
                <div style={styles.passwordForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      style={styles.formInput}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      style={styles.formInput}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      style={styles.formInput}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                    style={styles.saveButton}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div style={styles.securitySection}>
                <h3 style={styles.sectionTitle}>Sessions</h3>
                <div style={styles.sessionCard}>
                  <div style={styles.sessionInfo}>
                    <span style={styles.sessionIcon}>💻</span>
                    <div>
                      <div style={styles.sessionDevice}>Current Session</div>
                      <div style={styles.sessionDetails}>This device • Active now</div>
                    </div>
                  </div>
                  <button style={styles.logoutButton}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div style={styles.tabContent}>
              <h2 style={styles.tabTitle}>Preferences</h2>
              
              <div style={styles.preferenceSection}>
                <h3 style={styles.sectionTitle}>Notification Settings</h3>
                
                <div style={styles.preferenceItem}>
                  <div>
                    <div style={styles.preferenceName}>Email Notifications</div>
                    <div style={styles.preferenceDesc}>Receive email updates about your files</div>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>

                <div style={styles.preferenceItem}>
                  <div>
                    <div style={styles.preferenceName}>File Upload Notifications</div>
                    <div style={styles.preferenceDesc}>Get notified when files are uploaded</div>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>

                <div style={styles.preferenceItem}>
                  <div>
                    <div style={styles.preferenceName}>Share Notifications</div>
                    <div style={styles.preferenceDesc}>Notifications when files are shared with you</div>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>

              <div style={styles.preferenceSection}>
                <h3 style={styles.sectionTitle}>Display Settings</h3>
                
                <div style={styles.preferenceItem}>
                  <div>
                    <div style={styles.preferenceName}>Default View</div>
                    <div style={styles.preferenceDesc}>Choose how files are displayed by default</div>
                  </div>
                  <select style={styles.selectInput}>
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div style={styles.tabContent}>
              <h2 style={styles.tabTitle}>Danger Zone</h2>
              
              <div style={styles.dangerCard}>
                <div style={styles.dangerIcon}>⚠️</div>
                <div style={styles.dangerContent}>
                  <h3 style={styles.dangerTitle}>Delete Account</h3>
                  <p style={styles.dangerText}>
                    Once you delete your account, there is no going back. This will permanently remove all your data, including files, shares, and preferences.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    style={styles.deleteButton}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>

              <div style={styles.dangerCard}>
                <div style={styles.dangerIcon}>📤</div>
                <div style={styles.dangerContent}>
                  <h3 style={styles.dangerTitle}>Export Data</h3>
                  <p style={styles.dangerText}>
                    Download all your data in a portable format before deleting your account.
                  </p>
                  <button
                    onClick={() => alert("Export functionality coming soon")}
                    style={styles.exportButton}
                  >
                    Export My Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#5f6368',
    margin: 0,
  },
  container: {
    display: 'flex',
    gap: '30px',
    minHeight: 'calc(100vh - 200px)',
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
  },
  userInfoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    marginBottom: '20px',
  },
  userAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#4285F4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    margin: '0 auto 16px',
  },
  avatarText: {
    fontSize: '32px',
    fontWeight: '600',
    color: 'white',
  },
  userDetails: {
    textAlign: 'center',
  },
  userName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 4px 0',
  },
  userEmail: {
    fontSize: '14px',
    color: '#5f6368',
    margin: '0 0 12px 0',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
  },
  nav: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  navButton: {
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    borderBottom: '1px solid #f1f3f4',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  navIcon: {
    fontSize: '18px',
    width: '24px',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    minHeight: '500px',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  tabTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#202124',
    margin: 0,
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#3367d6',
    },
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  infoItem: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '12px',
    color: '#5f6368',
    marginBottom: '6px',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '15px',
    color: '#202124',
    fontWeight: '500',
  },
  statsSection: {
    borderTop: '1px solid #f1f3f4',
    paddingTop: '30px',
  },
  statsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 20px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '24px',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#5f6368',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
  },
  formInput: {
    padding: '12px 16px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#4285F4',
      boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.1)',
    },
    '&:disabled': {
      backgroundColor: '#f8f9fa',
    },
  },
  selectInput: {
    padding: '12px 16px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s',
    maxWidth: '200px',
    '&:focus': {
      borderColor: '#4285F4',
      boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.1)',
    },
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#3367d6',
    },
    '&:disabled': {
      backgroundColor: '#e0e0e0',
      cursor: 'not-allowed',
    },
  },
  saveButtonLoading: {
    padding: '12px 24px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'not-allowed',
    opacity: 0.8,
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#f8f9fa',
    color: '#5f6368',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f1f3f4',
    },
  },
  securitySection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 16px 0',
  },
  passwordForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '400px',
  },
  sessionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '500px',
  },
  sessionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sessionIcon: {
    fontSize: '24px',
  },
  sessionDevice: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#202124',
  },
  sessionDetails: {
    fontSize: '12px',
    color: '#5f6368',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    color: '#ea4335',
    border: '1px solid #dadce0',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#fce8e6',
    },
  },
  preferenceSection: {
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid #f1f3f4',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  preferenceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  preferenceName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '4px',
  },
  preferenceDesc: {
    fontSize: '12px',
    color: '#5f6368',
  },
  toggleSwitch: {
    position: 'relative',
    display: 'inline-block',
    width: '52px',
    height: '26px',
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '.4s',
    borderRadius: '34px',
    '&:before': {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      transition: '.4s',
      borderRadius: '50%',
    },
  },
  dangerCard: {
    backgroundColor: '#fce8e6',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px',
  },
  dangerIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  dangerContent: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#c5221f',
    margin: '0 0 8px 0',
  },
  dangerText: {
    fontSize: '14px',
    color: '#c5221f',
    margin: '0 0 16px 0',
    opacity: 0.8,
  },
  deleteButton: {
    padding: '12px 24px',
    backgroundColor: '#ea4335',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#d62516',
    },
  },
  exportButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#ea4335',
    border: '1px solid #ea4335',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(234, 67, 53, 0.1)',
    },
  },
};

// Add toggle switch checked state
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  input:checked + .toggleSlider {
    background-color: #34a853;
  }
  input:checked + .toggleSlider:before {
    transform: translateX(26px);
  }
`, styleSheet.cssRules.length);

export default Profile;