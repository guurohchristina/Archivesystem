import React from "react";
import { BrowserRouter, Routes, Route, Link} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";


import Navbar from "./components/Navbar.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Upload from "./pages/Upload.jsx";


import ManageUsers from "./pages/ManageUsers.jsx";
import ManageFiles from "./pages/ManageFiles.jsx";
import SystemReports from "./pages/SystemReports.jsx";
import MyFiles from "./pages/MyFiles.jsx";
import SystemSetting from "./pages/SystemSettings.jsx";
import SharedwithMe from "./pages/SharedwithMe.jsx";





function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />



          // In your App.jsx, make sure you have these routes:
<Route path="/upload" element={<Upload />} />
<Route path="/manage-users" element={<ManageUsers />} />
<Route path="/manage-files" element={<ManageFiles />} />
<Route path="/system-reports" element={<SystemReports />} />
<Route path="/my-files" element={<MyFiles />} />
<Route path="/profile" element={<Profile />} />
<Route path="/system-settings" element={<SystemSetting />} />
<Route path="/shared-files" element={<SharedwithMe />} />
        
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

/*
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";

// ... your imports

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Public routes - only accessible when NOT logged in 
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Protected routes - only accessible when logged in 
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;*/
