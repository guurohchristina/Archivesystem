
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const ManageUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&limit=10&search=${search}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data.users);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('User role updated successfully');
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their files.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('User deleted successfully');
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="page">
      <h1>Manage Users</h1>
      
      <div className="admin-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="stats-summary">
          <span>Total Users: {users.length > 0 ? users[0]?.pagination?.totalUsers || 'Loading...' : '0'}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Files</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id}>
                    <td>{userItem.id}</td>
                    <td>{userItem.name}</td>
                    <td>{userItem.email}</td>
                    <td>
                      <select
                        value={userItem.role}
                        onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                        className="role-select"
                        disabled={userItem.id === user?.id} // Can't change own role
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{userItem.file_count || 0}</td>
                    <td>{formatDate(userItem.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => deleteUser(userItem.id, userItem.name)}
                          className="action-btn delete-btn"
                          disabled={userItem.id === user?.id} // Can't delete yourself
                          title={userItem.id === user?.id ? "Cannot delete your own account" : ""}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span>Page {currentPage} of {totalPages}</span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageUsers;