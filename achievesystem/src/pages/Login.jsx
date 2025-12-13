import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setLoginError(error.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (loginError) setLoginError("");
  };

  const quickAdminLogin = () => {
    setFormData({
      email: "archieveadmin@gmail.com",
      password: "Admin@123"
    });
  };

  const quickUserLogin = () => {
    setFormData({
      email: "test@example.com",
      password: "password123"
    });
  };

  const debugAdmin = async () => {
    console.log("🛠️ Debug admin login...");
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "archieveadmin@gmail.com",
        password: "Admin@123"
      })
    });
    
    const result = await response.json();
    console.log("Debug result:", result);
    alert(`Debug Result:\nSuccess: ${result.success}\nMessage: ${result.message}\nRole: ${result.user?.role}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginContainer}>
        {/* Left Panel - Branding/Info */}
        <div style={styles.leftPanel}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📁</span>
            <div style={styles.logoText}>
              <h1 style={styles.logoTitle}>Archive</h1>
              <p style={styles.logoSubtitle}>Management System</p>
            </div>
          </div>
          
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🔒</span>
              <div>
                <h3 style={styles.featureTitle}>Secure Access</h3>
                <p style={styles.featureDesc}>Enterprise-grade security for all your files</p>
              </div>
            </div>
            
            <div style={styles.feature}>
              <span style={styles.featureIcon}>📊</span>
              <div>
                <h3 style={styles.featureTitle}>Easy Management</h3>
                <p style={styles.featureDesc}>Organize and manage documents efficiently</p>
              </div>
            </div>
            
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🤝</span>
              <div>
                <h3 style={styles.featureTitle}>Collaborate</h3>
                <p style={styles.featureDesc}>Share files securely with team members</p>
              </div>
            </div>
          </div>
          
          <div style={styles.bottomInfo}>
            <p style={styles.infoText}>Trusted by organizations worldwide</p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2>Welcome Back</h2>
              {/*<p style={styles.formSubtitle}>Sign in to access your files</p>*/}
            </div>

            {/* Login Error Display */}
            {loginError && (
              <div style={styles.errorAlert}>
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{loginError}</span>
              </div>
            )}

            <form onSubmit={submit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="email">Email Address</label>
                <div style={styles.inputContainer}>
                  <span style={styles.inputIcon}>✉️</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={loading}
                    style={styles.input}
                  />
                </div>
                {errors.email && <span style={styles.errorMessage}>{errors.email}</span>}
              </div>

              <div style={styles.formGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label} htmlFor="password">Password</label>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={styles.showPasswordButton}
                  >
                    {showPassword ? " Hide" : "👁️ Show"}
                  </button>
                </div>
                <div style={styles.inputContainer}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={loading}
                    style={styles.input}
                  />
                </div>
                {errors.password && <span style={styles.errorMessage}>{errors.password}</span>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={loading ? styles.submitButtonLoading : styles.submitButton}
              >
                {loading ? (
                  <>
                    <div style={styles.spinner}></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span style={styles.buttonIcon}>→</span>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Section */}
            <div style={styles.quickLoginSection}>
              <div style={styles.separator}>
                <span style={styles.separatorText}>Quick Test Logins</span>
              </div>

              <div style={styles.quickLoginButtons}>
                <button 
                  type="button"
                  onClick={quickAdminLogin}
                  style={styles.quickButton}
                >
                  <span style={styles.quickButtonIcon}>👑</span>
                  Admin Login
                </button>
              {/*  <button 
                  type="button"
                  onClick={quickUserLogin}
                  style={styles.quickButton}
                >
                  <span style={styles.quickButtonIcon}>👤</span>
                  Test User Login
                </button>
                <button 
                  type="button"
                  onClick={debugAdmin}
                  style={styles.debugButton}
                >
                  <span style={styles.quickButtonIcon}>🛠️</span>
                  Debug Admin
                </button>*/}
              </div>

              <div style={styles.credentialsInfo}>
                <div style={styles.credentialItem}>
                  <span style={styles.credentialLabel}>Admin:</span>
                  <span style={styles.credentialValue}>archieveadmin@gmail.com</span>
                  <span style={styles.credentialPassword}>Admin@123</span>
                </div>
               {/* <div style={styles.credentialItem}>
                  <span style={styles.credentialLabel}>Test User:</span>
                  <span style={styles.credentialValue}>test@example.com</span>
                  <span style={styles.credentialPassword}>password123</span>
                </div>*/}
              </div>
            </div>

            <div style={styles.registerLink}>
              <p style={styles.registerText}>
                Don't have an account?{" "}
                <Link to="/register" style={styles.registerLinkButton}>
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  loginContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1000px',
    height: '600px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#4285F4',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: 'white',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '40px',
  },
  logoIcon: {
    fontSize: '48px',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: 'white',
  },
  logoSubtitle: {
    fontSize: '14px',
    opacity: 0.9,
    margin: 0,
  },
  features: {
    flex: 1,
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '30px',
  },
  featureIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: 'white',
  },
  featureDesc: {
    fontSize: '14px',
    opacity: 0.8,
    margin: 0,
    lineHeight: 1.4,
  },
  bottomInfo: {
    textAlign: 'center',
  },
  infoText: {
    fontSize: '13px',
    opacity: 0.7,
    margin: 0,
  },
  rightPanel: {
    flex: 1,
    padding: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#5f6368',
    margin: 0,
  },
  errorAlert: {
    backgroundColor: '#fce8e6',
    border: '1px solid #fadbd8',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  errorIcon: {
    fontSize: '16px',
    color: '#ea4335',
  },
  errorText: {
    fontSize: '14px',
    color: '#c5221f',
    flex: 1,
  },
  form: {
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    marginBottom: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  showPasswordButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#4285F4',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f1f3f4',
    },
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#5f6368',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
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
      cursor: 'not-allowed',
    },
  },
  errorMessage: {
    display: 'block',
    fontSize: '12px',
    color: '#ea4335',
    marginTop: '6px',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    marginTop: '10px',
    '&:hover': {
      backgroundColor: '#3367d6',
    },
    '&:disabled': {
      backgroundColor: '#e0e0e0',
      cursor: 'not-allowed',
    },
  },
  submitButtonLoading: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '10px',
    opacity: 0.8,
  },
  spinner: {
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
  },
  buttonIcon: {
    fontSize: '18px',
  },
  quickLoginSection: {
    marginBottom: '30px',
  },
  separator: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '20px 0',
  },
  separatorText: {
    padding: '0 15px',
    fontSize: '12px',
    color: '#5f6368',
    backgroundColor: 'white',
    position: 'relative',
    zIndex: 1,
  },
  quickLoginButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  quickButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#f8f9fa',
    color: '#202124',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    minWidth: '120px',
    '&:hover': {
      backgroundColor: '#f1f3f4',
      borderColor: '#c4c7c5',
    },
  },
  debugButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    minWidth: '120px',
    '&:hover': {
      backgroundColor: '#5e32b1',
    },
  },
  quickButtonIcon: {
    fontSize: '16px',
  },
  credentialsInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '12px',
  },
  credentialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  credentialLabel: {
    fontWeight: '600',
    color: '#202124',
    minWidth: '80px',
  },
  credentialValue: {
    color: '#5f6368',
    flex: 1,
  },
  credentialPassword: {
    color: '#ea4335',
    fontWeight: '500',
  },
  registerLink: {
    textAlign: 'center',
    borderTop: '1px solid #f1f3f4',
    paddingTop: '20px',
  },
  registerText: {
    fontSize: '14px',
    color: '#5f6368',
    margin: 0,
  },
  registerLinkButton: {
    color: '#4285F4',
    textDecoration: 'none',
    fontWeight: '600',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

// Add separator line pseudo-element
styleSheet.insertRule(`
  .separator::before {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #dadce0;
  }
`, styleSheet.cssRules.length);

export default Login;