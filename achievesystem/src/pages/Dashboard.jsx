/*const Dashboard = () => {

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Your documents, uploads, and activity overview.</p>
    </div>
  );
};

export default Dashboard;*/


import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page">
      <h1>Welcome {user?.name}</h1>
      
      <div className="profile-info">
        <h2>Your Profile</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        
        {user?.role === "admin" ? (
          // Admin Dashboard
          <div className="admin-actions">
            <h3>Administrator Tools</h3>
            <button onClick={() => navigate("/upload")}>Upload Files</button>
            <button onClick={() => navigate("/manage-users")}>Manage Users</button>
            <button onClick={() => navigate("/all-files")}>View All Files</button>
            <button onClick={() => navigate("/reports")}>System Reports</button>
            <button onClick={() => navigate("/system-settings")}>System Settings</button>
          </div>
        ) : (
          // User Dashboard
          <div className="user-actions">
            <h3>Your Files</h3>
            <button onClick={() => navigate("/upload")}>Upload New File</button>
            <button onClick={() => navigate("/my-files")}>View My Files</button>
            <button onClick={() => navigate("/shared-files")}>Shared With Me</button>
            <button onClick={() => navigate("/profile")}>Edit Profile</button>
            <button onClick={() => navigate("/settings")}>Account Settings</button>
          </div>
        )}

        <div className="general-actions">
          <h3>General</h3>
          <button onClick={() => navigate("/help")}>Help & Support</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;