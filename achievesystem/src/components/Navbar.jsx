import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
 // Helper function to check if a link is active
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  }; 
  
  

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo/Brand */}
        <div style={styles.brandContainer}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📁</span>
            <div style={styles.logoText}>
              <h1 style={styles.logoTitle}>Archive</h1>
              <p style={styles.logoSubtitle}>Management System</p>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMobileMenu}
            style={styles.mobileMenuButton}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div style={styles.desktopNav}>
          {!user ? (
            <div style={styles.navLinks}>
              <Link to="/login" style={styles.navLink}>
                <span style={styles.linkIcon}>🔐</span>
                Login
              </Link>
              <Link to="/register" style={styles.navButton}>
                <span style={styles.linkIcon}>📝</span>
                Register
              </Link>
            </div>
          ) : (
            <div style={styles.navLinks}>
             {/* <Link to="/" style={styles.navLink}>
                <span style={styles.linkIcon}>🏠</span>
                Home
              </Link>*/}
              <Link to="/dashboard" style={styles.navLink}>
                <span style={styles.linkIcon}>📊</span>
                Dashboard
              </Link>
          
              {user.role === "admin" && (
                <Link to="/admin" style={styles.adminLink}>
                  <span style={styles.linkIcon}>👑</span>
                  Admin
                </Link>
              )}
              
              {/* User Profile */}
              {/*
              <div style={styles.userProfile}>
                <div style={styles.userAvatar}>
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={styles.userInfo}>
                  <p style={styles.userName}>{user.name || 'User'}</p>
                  <p style={styles.userEmail}>{user.email || ''}</p>
                </div>
              </div>*/}
              
              <button onClick={handleLogout} style={styles.logoutButton}>
                <span style={styles.linkIcon}>🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div style={styles.mobileNav}>
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  style={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={styles.linkIcon}>🔐</span>
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={styles.mobileButton}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={styles.linkIcon}>📝</span>
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  style={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={styles.linkIcon}>🏠</span>
                  Home
                </Link>
              {/*  <Link 
                  to="/dashboard" 
                  style={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={styles.linkIcon}>📊</span>
                  Dashboard
                </Link>*/}
                
                <Link 
                  to="/dashboard" 
                  style={{
                    ...styles.mobileLink,
                    backgroundColor: isActive("/dashboard") ? '#f1f3f4' : 'transparent',
                    color: isActive("/dashboard") ? '#202124' : '#5f6368',
                    fontWeight: isActive("/dashboard") ? '600' : '500',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={styles.linkIcon}>📊</span>
                  Dashboard
                </Link>
              
            
                {user.role === "admin" && (
                  <Link 
                    to="/admin" 
                    style={styles.mobileAdminLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span style={styles.linkIcon}>👑</span>
                    Admin Panel
                  </Link>
                )}
                
                {/* User info in mobile */}
                <div style={styles.mobileUserInfo}>
                  <div style={styles.mobileUserAvatar}>
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={styles.mobileUserName}>{user.name || 'User'}</p>
                    <p style={styles.mobileUserEmail}>{user.email || ''}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }} 
                  style={styles.mobileLogoutButton}
                >
                  <span style={styles.linkIcon}>🚪</span>
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    width:'100%',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    borderBottom: '1px solid #dadce0',
    padding: '0 20px',
    position: 'fixed',
    top: 0,
    zIndex: 1000,
  },
  container: {
    
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '64px'
    
  
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#202124',
    margin: 0,
    lineHeight: '1.2',
  },
  logoSubtitle: {
    fontSize: '12px',
    color: '#5f6368',
    margin: 0,
    fontWeight: '400',
  },
  mobileMenuButton: {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '8px',
    borderRadius: '4px',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    color: '#5f6368',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      color: '#202124',
    },
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: '#4285F4',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#3367d6',
    },
  },
  adminLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#f8f9fa',
    color: '#ea4335',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #f1f3f4',
    '&:hover': {
      backgroundColor: '#fce8e6',
    },
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: '12px',
    marginRight: '8px',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #f1f3f4',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#4285F4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#202124',
  },
  userEmail: {
    margin: 0,
    fontSize: '11px',
    color: '#5f6368',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#f8f9fa',
    color: '#ea4335',
    border: '1px solid #f1f3f4',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#fce8e6',
    },
  },
  mobileNav: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      borderTop: '1px solid #dadce0',
      zIndex: 1000,
    },
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    color: '#5f6368',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    borderBottom: '1px solid #f1f3f4',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  mobileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#4285F4',
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    border: 'none',
    textAlign: 'left',
    '&:hover': {
      backgroundColor: '#3367d6',
    },
  },
  mobileAdminLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    color: '#ea4335',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    borderBottom: '1px solid #f1f3f4',
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f3f4',
    backgroundColor: '#f8f9fa',
  },
  mobileUserAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4285F4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px',
  },
  mobileUserName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#202124',
  },
  mobileUserEmail: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#5f6368',
  },
  mobileLogoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    color: '#ea4335',
    border: 'none',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    borderBottom: '1px solid #f1f3f4',
    '&:hover': {
      backgroundColor: '#fce8e6',
    },
  },
  linkIcon: {
    fontSize: '16px',
  },
};

// Add media query styles
const mediaQueries = `
  @media (max-width: 768px) {
    .mobile-menu-button {
      display: block !important;
    }
    .desktop-nav {
      display: none !important;
    }
    .mobile-nav {
      display: flex !important;
    }
  }
`;

export default Navbar;