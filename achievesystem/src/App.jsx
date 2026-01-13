import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";

// Import all your page components
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
// ... import other pages

// Router wrapper component
function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Current pathname:", location.pathname);
    
    // If the pathname contains 'index.html', redirect to root
    if (location.pathname.includes('index.html')) {
      console.log("Redirecting from index.html to /");
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Navbar />
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-files" element={<Dashboard />} />
          <Route path="/upload" element={<Dashboard />} />
          <Route path="/shared-files" element={<Dashboard />} />
          <Route path="/profile" element={<Dashboard />} />
          
          
          
        
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;