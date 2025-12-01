/*import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="page">
      <h1>Profile</h1>

      <p><b>Name:</b> {user?.name}</p>
      <p><b>Email:</b> {user?.email}</p>
      <p><b>Role:</b> {user?.role}</p>
    </div>
  );
};

export default Profile;*/


import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  const handleSave = () => {
    // TODO: Implement profile update functionality
    alert("Profile updated! (This will be implemented later)");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="page">
      <h1>Your Profile</h1>
      
      <div className="profile-card">
        {!isEditing ? (
          // View Mode
          <>
            <h2>Personal Information</h2>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
            
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </>
        ) : (
          // Edit Mode
          <>
            <h2>Edit Profile</h2>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <button onClick={handleSave}>Save Changes</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </>
        )}
      </div>

      <div className="account-actions">
        <h2>Account Management</h2>
        <button onClick={() => alert("Change password functionality coming soon")}>
          Change Password
        </button>
        <button onClick={() => alert("Account deletion functionality coming soon")}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;