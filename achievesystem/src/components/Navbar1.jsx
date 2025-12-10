import { Link, useNavigate } from "react-router-dom";


import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () =>{
    logout();
    navigate("/");
  };

  return (
    <div className="nav-container">
      <h1>Archieve <br></br>system</h1>
    
    <div className="nav">

      
      

      {!user && (
        <>
      
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}

      {user && (
        <>
        <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        
          

          

          {user.role === "admin"}

          <button onClick={handleLogout}>Logout</button>

          
        </>
      )}
    </div>
    </div>
  );
};

export default Navbar;

// src/components/Navbar.jsx
/*
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={() => setIsMenuOpen(false)}>
          Archive System
        </Link>
        
        {/* Mobile Menu Toggle 
        <div className="menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        {/* Navigation Links 
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {user ? (
            // Show when user is logged in
            <>
              <span className="user-greeting">Welcome, {user.name}!</span>
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
              <Link to="/upload" onClick={() => setIsMenuOpen(false)}>Upload</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            // Show when user is not logged in
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;*/



/*import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          Archive System
        </Link>
        
        <div className="nav-links">
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {user && (
            <>
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/upload">Upload</Link>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;*/