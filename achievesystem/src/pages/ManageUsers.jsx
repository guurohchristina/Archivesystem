
/*fall back on
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const ManageUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE = 'https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev'
  useEffect(() => {
    fetchUsers();
  }, [currentPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/api/admin/users`,
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
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
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
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
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

export default ManageUsers;*/



/*
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const ManageUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debugData, setDebugData] = useState(null);

  const API_BASE = 'https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev';

  useEffect(() => {
    if (user) {
      console.log("🔄 ManageUsers useEffect triggered");
      console.log("👤 User:", user);
      console.log("🎯 User role:", user?.role);
      console.log("📅 Current page:", currentPage);
      console.log("🔍 Search term:", search);
      fetchUsers();
    }
  }, [currentPage, search, user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    setDebugData(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      if (!user || user.role !== 'admin') {
        throw new Error('You do not have admin privileges. Your role: ' + (user?.role || 'none'));
      }

      console.log("📡 Starting fetchUsers...");
      console.log("🔑 Token preview:", token.substring(0, 20) + "...");
      console.log("👤 User from context:", user);

      // Build the URL
      const url = new URL(`${API_BASE}/api/admin/users`);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('limit', 10);
      if (search) {
        url.searchParams.append('search', search);
      }

      console.log("🎯 Full URL:", url.toString());

      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      const endTime = Date.now();
      
      console.log(`⏱️ Request took: ${endTime - startTime}ms`);
      console.log("📨 Response status:", response.status, response.statusText);
      console.log("📨 Response headers:");
      [...response.headers.entries()].forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      // Get response as text first
      const responseText = await response.text();
      console.log("📄 Raw response (first 1000 chars):", responseText.substring(0, 1000));

      // Store debug data
      setDebugData({
        url: url.toString(),
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        responsePreview: responseText.substring(0, 500),
        timestamp: new Date().toISOString()
      });

      // Check if response is HTML (404 page or error)
      if (responseText.trim().startsWith('<!DOCTYPE') || 
          responseText.trim().startsWith('<html') ||
          responseText.includes('<!doctype')) {
        
        console.error("❌ Server returned HTML instead of JSON!");
        console.error("This usually means:");
        console.error("1. The route /api/admin/users doesn't exist");
        console.error("2. There's a server error returning HTML");
        console.error("3. Wrong URL or port");
        
        throw new Error(`Server returned HTML (likely 404). Route may not exist. Status: ${response.status}`);
      }

      // Parse JSON response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", parseError);
        console.error("Response was:", responseText);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      console.log("✅ Parsed JSON result:", result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (result.success) {
        // Handle different response structures
        if (result.data && Array.isArray(result.data.users)) {
          setUsers(result.data.users);
          setTotalPages(result.data.pagination?.totalPages || 1);
        } else if (Array.isArray(result.users)) {
          setUsers(result.users);
          setTotalPages(result.pagination?.totalPages || 1);
        } else if (Array.isArray(result.data)) {
          setUsers(result.data);
          setTotalPages(1);
        } else {
          console.error("⚠️ Unexpected response structure:", result);
          throw new Error('Unexpected response structure');
        }
        
        console.log(`✅ Successfully loaded ${users.length} users`);
      } else {
        throw new Error(result.message || 'Request failed');
      }

    } catch (error) {
      console.error("❌ Error in fetchUsers:", error);
      console.error("Stack trace:", error.stack);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive endpoint tester
  const runComprehensiveTest = async () => {
    console.clear();
    console.log("🧪 Starting comprehensive backend test...");
    console.log("=".repeat(50));
    
    const token = localStorage.getItem('token');
    const tests = [
      {
        name: "1. Health Check (No Auth)",
        url: `${API_BASE}/health`,
        method: "GET",
        auth: false
      },
      {
        name: "2. Root Endpoint",
        url: `${API_BASE}/`,
        method: "GET",
        auth: false
      },
      {
        name: "3. Test Auth (Upload Endpoint)",
        url: `${API_BASE}/api/upload`,
        method: "GET",
        auth: true
      },
      {
        name: "4. Admin Users Endpoint",
        url: `${API_BASE}/api/admin/users?page=1&limit=5`,
        method: "GET",
        auth: true
      },
      {
        name: "5. Check if Admin Routes Exist (HEAD)",
        url: `${API_BASE}/api/admin/users`,
        method: "HEAD",
        auth: true
      }
    ];

    const results = [];
    
    for (const test of tests) {
      console.log(`\n🔍 ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Method: ${test.method}`);
      
      try {
        const options = {
          method: test.method,
          headers: {}
        };
        
        if (test.auth && token) {
          options.headers['Authorization'] = `Bearer ${token}`;
          console.log(`   🔑 Using auth token`);
        }
        
        const startTime = Date.now();
        const response = await fetch(test.url, options);
        const endTime = Date.now();
        
        let body = '';
        if (test.method !== 'HEAD') {
          body = await response.text();
        }
        
        const result = {
          test: test.name,
          url: test.url,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          time: endTime - startTime,
          isHtml: body.includes('<!DOCTYPE') || body.includes('<html'),
          bodyPreview: body.substring(0, 200)
        };
        
        results.push(result);
        
        console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
        console.log(`   ⏱️ Time: ${result.time}ms`);
        console.log(`   📄 Content-Type: ${result.contentType}`);
        console.log(`   🏷️ Is HTML: ${result.isHtml}`);
        
        if (result.isHtml) {
          console.log(`   ⚠️ WARNING: Got HTML instead of JSON!`);
          console.log(`   Preview: ${result.bodyPreview}`);
        }
        
      } catch (testError) {
        console.log(`   ❌ Error: ${testError.message}`);
        results.push({
          test: test.name,
          url: test.url,
          error: testError.message
        });
      }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST RESULTS SUMMARY:");
    console.log("=".repeat(50));
    
    results.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.test}: ${result.error}`);
      } else {
        console.log(`${result.isHtml ? '⚠️' : '✅'} ${result.test}: ${result.status} ${result.statusText} (${result.time}ms)`);
        if (result.isHtml) {
          console.log(`   ⚠️ Returns HTML instead of JSON/API response`);
        }
      }
    });
    
    // Show results in UI
    setDebugData({
      testResults: results,
      timestamp: new Date().toISOString(),
      userInfo: {
        id: user?.id,
        role: user?.role,
        name: user?.name
      }
    });
  };

  const updateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
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
        fetchUsers();
      } else {
        alert(result.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('User deleted successfully');
        fetchUsers();
      } else {
        alert(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="page p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <button 
          onClick={runComprehensiveTest}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <span className="mr-2">🧪</span>
          Run Backend Tests
        </button>
      </div>

      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <span className="text-blue-600 mr-2">👤</span>
          <div>
            <span className="font-semibold">Logged in as:</span> {user?.name} 
            <span className="ml-4">
              <span className="font-semibold">Role:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${user?.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {user?.role || 'none'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <span className="text-red-500 mr-2">❌</span>
            <h3 className="font-semibold text-red-800">Error Loading Users</h3>
          </div>
          <p className="text-red-600 mb-3">{error}</p>
          <div className="flex space-x-2">
            <button 
              onClick={fetchUsers} 
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
            <button 
              onClick={runComprehensiveTest}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Debug Backend
            </button>
          </div>
        </div>
      )}


      {debugData && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Debug Information</h3>
            <button 
              onClick={() => setDebugData(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          
          {debugData.testResults ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Backend Test Results:</h4>
              {debugData.testResults.map((result, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="font-medium">{result.test}</div>
                  <div className="text-sm text-gray-600">URL: {result.url}</div>
                  {result.error ? (
                    <div className="text-red-600 text-sm">❌ Error: {result.error}</div>
                  ) : (
                    <>
                      <div className="text-sm">
                        Status: <span className={`font-medium ${result.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                          {result.status} {result.statusText}
                        </span>
                      </div>
                      <div className="text-sm">Time: {result.time}ms</div>
                      <div className="text-sm">Content-Type: {result.contentType}</div>
                      {result.isHtml && (
                        <div className="text-sm text-yellow-600 font-medium">
                          ⚠️ Returns HTML (not JSON)
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div><span className="font-medium">URL:</span> {debugData.url}</div>
              <div><span className="font-medium">Status:</span> {debugData.status} {debugData.statusText}</div>
              <div><span className="font-medium">Time:</span> {new Date(debugData.timestamp).toLocaleTimeString()}</div>
              <div className="mt-3">
                <span className="font-medium">Response Preview:</span>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {debugData.responsePreview}
                </pre>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={() => console.log('Full debug data:', debugData)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Full Debug Data in Console
            </button>
          </div>
        </div>
      )}

    
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              {!loading && `Total: ${users.length} users`}
            </div>
            <button
              onClick={() => setSearch("")}
              disabled={!search}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Clear Search
            </button>
          </div>
        </div>
      </div>

  
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4 text-gray-300">👥</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500">
            {search ? 'Try a different search term' : 'No users in the system'}
          </p>
        </div>
      ) : (
        <>
    
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{userItem.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{userItem.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={userItem.role}
                          onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          disabled={userItem.id === user?.id}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {userItem.file_count || 0} files
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(userItem.created_at || userItem.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteUser(userItem.id, userItem.name)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={userItem.id === user?.id}
                          title={userItem.id === user?.id ? "Cannot delete your own account" : ""}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

    
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

  
      <div className="mt-6 text-sm text-gray-500">
        <p>💡 <strong>Tip:</strong> If you're seeing errors, click "Run Backend Tests" to diagnose the issue.</p>
        <p>📋 Check the browser console for detailed debug information (F12 → Console).</p>
      </div>
    </div>
  );
};

export default ManageUsers;*/




import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const ManageUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Added error state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0); // Added totalUsers state

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    console.log("🔄 ManageUsers useEffect triggered");
    console.log("👤 User from context:", user);
    console.log("🔑 Token in localStorage:", localStorage.getItem('token') ? "Exists" : "Missing");
    fetchUsers();
  }, [currentPage, search, user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    
    try {
      const token = localStorage.getItem('token');
      
      // Debug: Check token
      console.log("🔍 Token being used:", token ? `${token.substring(0, 20)}...` : "NO TOKEN");
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Check if user is admin in context (additional safety)
      if (user?.role !== 'admin') {
        console.warn("⚠️ User role is not admin:", user?.role);
        // Don't throw here, let backend handle authorization
      }

      // Build URL with proper query parameters
      const url = new URL(`${API_BASE}/api/admin/users`);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', '10');
      if (search) {
        url.searchParams.append('search', search);
      }

      console.log("🌐 Fetching from:", url.toString());

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📨 Response status:", response.status);

      // Handle different HTTP statuses
      if (response.status === 401) {
        // Authentication failed
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        // Not authorized (not admin)
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access denied. Admin privileges required.');
      } else if (!response.ok) {
        // Other HTTP errors
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📦 API Response:", result);

      if (result.success) {
        // Handle the response structure - adjust based on your actual API
        if (result.data && Array.isArray(result.data.users)) {
          // Structure: { success: true, data: { users: [...], pagination: {...} } }
          setUsers(result.data.users);
          setTotalPages(result.data.pagination?.totalPages || 1);
          setTotalUsers(result.data.pagination?.totalUsers || 0);
        } else if (Array.isArray(result.users)) {
          // Structure: { success: true, users: [...], pagination: {...} }
          setUsers(result.users);
          setTotalPages(result.pagination?.totalPages || 1);
          setTotalUsers(result.pagination?.totalUsers || 0);
        } else if (Array.isArray(result.data)) {
          // Structure: { success: true, data: [...] }
          setUsers(result.data);
          setTotalPages(1);
          setTotalUsers(result.data.length);
        } else {
          console.error("Unexpected response structure:", result);
          throw new Error('Unexpected response format from server');
        }
      } else {
        // API returned success: false
        throw new Error(result.message || 'Request failed');
      }

    } catch (error) {
      console.error("❌ Error in fetchUsers:", error);
      
      // Handle specific JWT errors
      if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('malformed')) {
        setError('Authentication failed: Invalid or expired session. Please log out and log in again.');
        // Optional: Clear bad token
        localStorage.removeItem('token');
        // Optional: Redirect to login
        // window.location.href = '/login';
      } else if (error.message.includes('Access denied') || error.message.includes('Admin')) {
        setError(`Access denied: ${error.message}. Your role: ${user?.role || 'not set'}`);
      } else {
        setError(error.message || 'Failed to load users. Please try again.');
      }
      
      // Clear users on error
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert('User role updated successfully');
        fetchUsers(); // Refresh list
      } else {
        throw new Error(result.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert(`Failed to update user role: ${error.message}`);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their files.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert('User deleted successfully');
        fetchUsers(); // Refresh list
      } else {
        throw new Error(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleRetry = () => {
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Adjust based on your routes
  };

  // Add CSS for error display
  const errorStyle = {
    backgroundColor: '#fee',
    border: '1px solid #f99',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    color: '#c00'
  };

  const buttonStyle = {
    marginRight: '10px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div className="page" style={{ padding: '20px' }}>
      <h1>Manage Users</h1>
      
      {/* Error Display */}
      {error && (
        <div style={errorStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ marginRight: '10px', fontSize: '20px' }}>⚠️</span>
            <h3 style={{ margin: 0, color: '#900' }}>Error</h3>
          </div>
          <p style={{ margin: '0 0 15px 0' }}>{error}</p>
          <div>
            <button 
              onClick={handleRetry}
              style={{ ...buttonStyle, backgroundColor: '#4CAF50', color: 'white' }}
            >
              Try Again
            </button>
            {error.includes('Authentication failed') && (
              <button 
                onClick={handleLogout}
                style={{ ...buttonStyle, backgroundColor: '#f44336', color: 'white' }}
              >
                Logout & Login Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Admin Access Warning */}
      {user?.role !== 'admin' && !error && (
        <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px', color: '#856404' }}>⚠️</span>
            <span style={{ fontWeight: 'bold', color: '#856404' }}>Admin Access Required</span>
          </div>
          <p style={{ margin: '5px 0 0 0', color: '#856404' }}>
            You need administrator privileges to manage users. Your current role is: <strong>{user?.role || 'not set'}</strong>
          </p>
        </div>
      )}

      {/* Debug Info - Remove in production */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #e9ecef', 
        borderRadius: '8px', 
        padding: '10px', 
        marginBottom: '20px',
        fontSize: '12px',
        display: 'none' /* Set to 'block' to see debug info */
      }}>
        <strong>Debug Info:</strong><br />
        User Role: {user?.role}<br />
        Token: {localStorage.getItem('token') ? 'Exists' : 'Missing'}<br />
        Loading: {loading.toString()}<br />
        Users Count: {users.length}
      </div>
      
      <div className="admin-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px',
              width: '300px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        <div className="stats-summary" style={{ fontWeight: 'bold', color: '#333' }}>
          <span>Total Users: {loading ? 'Loading...' : totalUsers}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          Loading users...
        </div>
      ) : users.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
          <h3>No users found</h3>
          <p>{search ? 'Try a different search term' : 'No users in the system'}</p>
          {search && (
            <button 
              onClick={() => setSearch('')}
              style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="users-table-container" style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Files</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Joined</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{userItem.name}</td>
                    <td style={{ padding: '12px' }}>{userItem.email}</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={userItem.role}
                        onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                        style={{ 
                          padding: '6px', 
                          borderRadius: '4px', 
                          border: '1px solid #ccc',
                          backgroundColor: userItem.id === user?.id ? '#f5f5f5' : 'white'
                        }}
                        disabled={userItem.id === user?.id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>{userItem.file_count || 0}</td>
                    <td style={{ padding: '12px' }}>{formatDate(userItem.created_at || userItem.createdAt)}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => deleteUser(userItem.id, userItem.name)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: userItem.id === user?.id ? '#ccc' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: userItem.id === user?.id ? 'not-allowed' : 'pointer'
                        }}
                        disabled={userItem.id === user?.id}
                        title={userItem.id === user?.id ? "Cannot delete your own account" : ""}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '20px', 
              marginTop: '30px' 
            }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === 1 ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              
              <span style={{ fontWeight: 'bold' }}>Page {currentPage} of {totalPages}</span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === totalPages ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
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