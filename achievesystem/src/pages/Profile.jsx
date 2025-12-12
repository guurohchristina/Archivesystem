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

  // Inline styles for simplicity
  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#202124',
          margin: '0 0 8px 0'
        }}>Account Settings</h1>
        <p style={{
          fontSize: '15px',
          color: '#5f6368',
          margin: 0
        }}>Manage your profile and account preferences</p>
      </div>

      <div style={{
        display: 'flex',
        gap: '30px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        {/* Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#4285F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <span style={{
                fontSize: '32px',
                fontWeight: '600',
                color: 'white'
              }}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#202124',
                margin: '0 0 4px 0'
              }}>{user?.name || "User"}</h3>
              <p style={{
                fontSize: '14px',
                color: '#5f6368',
                margin: '0 0 12px 0'
              }}>{user?.email || ""}</p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: getRoleBadgeColor(user?.role)
              }}>
                {user?.role || "User"}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            {['profile', 'security', 'preferences', 'danger'].map((tab) => (
              <button
                key={tab}
                style={{
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
                  backgroundColor: activeTab === tab ? 
                    (tab === 'danger' ? '#fce8e6' : '#e8f0fe') : 'transparent',
                  color: activeTab === tab ? 
                    (tab === 'danger' ? '#ea4335' : '#4285F4') : '#5f6368',
                  transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab(tab)}
              >
                <span style={{ fontSize: '18px', width: '24px' }}>
                  {tab === 'profile' ? '👤' : 
                   tab === 'security' ? '🔒' : 
                   tab === 'preferences' ? '⚙️' : '⚠️'}
                </span>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            minHeight: '500px'
          }}>
            
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px'
                }}>
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    color: '#202124',
                    margin: 0
                  }}>Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
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
                        gap: '6px'
                      }}
                    >
                      <span>✏️</span>
                      Edit Profile
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '20px',
                      marginBottom: '30px'
                    }}>
                      {[
                        { label: 'Full Name', value: user?.name || "Not set" },
                        { label: 'Email Address', value: user?.email || "Not set" },
                        { label: 'Phone Number', value: user?.phone || "Not provided" },
                        { label: 'Department', value: user?.department || "General" },
                        { label: 'User ID', value: user?.id || "N/A" },
                        { label: 'Account Created', value: formatDate(user?.created_at) }
                      ].map((item, index) => (
                        <div key={index} style={{
                          padding: '16px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#5f6368',
                            marginBottom: '6px',
                            fontWeight: '500'
                          }}>{item.label}</div>
                          <div style={{
                            fontSize: '15px',
                            color: '#202124',
                            fontWeight: '500'
                          }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {[
                        { 
                          label: 'Full Name *', 
                          type: 'text', 
                          value: profileData.name,
                          onChange: (e) => setProfileData(prev => ({ ...prev, name: e.target.value }))
                        },
                        { 
                          label: 'Email Address *', 
                          type: 'email', 
                          value: profileData.email,
                          onChange: (e) => setProfileData(prev => ({ ...prev, email: e.target.value }))
                        },
                        { 
                          label: 'Phone Number', 
                          type: 'tel', 
                          value: profileData.phone,
                          onChange: (e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))
                        }
                      ].map((field, index) => (
                        <div key={index}>
                          <label style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#202124',
                            display: 'block',
                            marginBottom: '8px'
                          }}>{field.label}</label>
                          <input
                            type={field.type}
                            value={field.value}
                            onChange={field.onChange}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: '1px solid #dadce0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                        </div>
                      ))}
                      
                      <div>
                        <label style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#202124',
                          display: 'block',
                          marginBottom: '8px'
                        }}>Department</label>
                        <select
                          value={profileData.department}
                          onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        >
                          <option value="General">General</option>
                          <option value="IT">IT Department</option>
                          <option value="HR">Human Resources</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#f8f9fa',
                            color: '#5f6368',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#202124',
                  margin: '0 0 30px 0'
                }}>Security Settings</h2>
                
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#202124',
                    margin: '0 0 16px 0'
                  }}>Change Password</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                    {[
                      { label: 'Current Password', value: passwordData.currentPassword, 
                        onChange: (e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value })) },
                      { label: 'New Password', value: passwordData.newPassword,
                        onChange: (e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value })) },
                      { label: 'Confirm New Password', value: passwordData.confirmPassword,
                        onChange: (e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value })) }
                    ].map((field, index) => (
                      <div key={index}>
                        <label style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#202124',
                          display: 'block',
                          marginBottom: '8px'
                        }}>{field.label}</label>
                        <input
                          type="password"
                          value={field.value}
                          onChange={field.onChange}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    ))}
                    <button
                      onClick={handleChangePassword}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#202124',
                  margin: '0 0 30px 0'
                }}>Danger Zone</h2>
                
                <div style={{
                  backgroundColor: '#fce8e6',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '32px', flexShrink: 0 }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#c5221f',
                      margin: '0 0 8px 0'
                    }}>Delete Account</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#c5221f',
                      margin: '0 0 16px 0',
                      opacity: 0.8
                    }}>
                      Once you delete your account, there is no going back. This will permanently remove all your data.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#ea4335',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#202124',
                  margin: '0 0 30px 0'
                }}>Preferences</h2>
                
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#202124',
                    margin: '0 0 16px 0'
                  }}>Notification Settings</h3>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#202124',
                        marginBottom: '4px'
                      }}>Email Notifications</div>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>
                        Receive email updates about your files
                      </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '26px' }}>
                      <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#34a853',
                        transition: '.4s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '18px',
                          width: '18px',
                          left: '4px',
                          bottom: '4px',
                          backgroundColor: 'white',
                          transition: '.4s',
                          borderRadius: '50%',
                          transform: 'translateX(26px)'
                        }} />
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;