import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    
    if (!data.name.trim()) newErrors.name = "Full name is required";
    else if (data.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    
    if (!data.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Please enter a valid email address";
    
    if (!data.password) newErrors.password = "Password is required";
    else if (data.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[A-Z])/.test(data.password)) newErrors.password = "Password must contain at least one uppercase letter";
    else if (!/(?=.*[a-z])/.test(data.password)) newErrors.password = "Password must contain at least one lowercase letter";
    else if (!/(?=.*\d)/.test(data.password)) newErrors.password = "Password must contain at least one number";
    
    if (!data.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setRegistrationError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(data);
      // Show success message before redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      setRegistrationError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (registrationError) setRegistrationError("");
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const checkPasswordStrength = () => {
    const password = data.password;
    if (!password) return { strength: 0, label: "No password", color: "#5f6368" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengths = [
      { label: "Very Weak", color: "#ea4335" },
      { label: "Weak", color: "#fbbc04" },
      { label: "Fair", color: "#fbbc04" },
      { label: "Good", color: "#34a853" },
      { label: "Strong", color: "#34a853" },
      { label: "Very Strong", color: "#34a853" },
    ];
    
    return {
      strength: score,
      label: strengths[score].label,
      color: strengths[score].color,
      percentage: (score / 5) * 100
    };
  };

  const passwordStrength = checkPasswordStrength();

  return (
    <div style={styles.pageContainer}>
      <div style={styles.registerContainer}>
        {/* Left Panel - Form */}
        <div style={styles.formPanel}>
          <div style={styles.formHeader}>
            <div style={styles.backToHome}>
              <Link to="/" style={styles.backLink}>
                ← Back to Home
              </Link>
            </div>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Join our secure archive management system</p>
          </div>

          {/* Registration Error Display */}
          {registrationError && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{registrationError}</span>
            </div>
          )}

          <form onSubmit={submit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="name">
                Full Name
                <span style={styles.required}> *</span>
              </label>
              <div style={styles.inputContainer}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  id="name"
                  type="text"
                  placeholder="guuroh Tina"
                  value={data.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={loading}
                  style={styles.input}
                />
              </div>
              {errors.name && <span style={styles.errorMessage}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">
                Email Address
                <span style={styles.required}> *</span>
              </label>
              <div style={styles.inputContainer}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  id="email"
                  type="email"
                  placeholder="guuroh.tina@example.com"
                  value={data.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  style={styles.input}
                />
              </div>
              {errors.email && <span style={styles.errorMessage}>{errors.email}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="password">
                Password
                <span style={styles.required}> *</span>
              </label>
              <div style={styles.inputContainer}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={data.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={loading}
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password")}
                  style={styles.passwordToggle}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {data.password && (
                <div style={styles.passwordStrength}>
                  <div style={styles.strengthBar}>
                    <div 
                      style={{
                        ...styles.strengthFill,
                        width: `${passwordStrength.percentage}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <div style={styles.strengthInfo}>
                    <span style={{ color: passwordStrength.color, fontSize: '12px', fontWeight: '500' }}>
                      {passwordStrength.label}
                    </span>
                    <span style={styles.strengthScore}>{passwordStrength.strength}/5</span>
                  </div>
                </div>
              )}
              
              {/* Password Requirements */}
              <div style={styles.passwordRequirements}>
                <p style={styles.requirementsTitle}>Password must contain:</p>
                <ul style={styles.requirementsList}>
                  <li style={{ color: data.password.length >= 8 ? '#34a853' : '#5f6368' }}>
                    ✓ At least 8 characters
                  </li>
                  <li style={{ color: /[A-Z]/.test(data.password) ? '#34a853' : '#5f6368' }}>
                    ✓ One uppercase letter
                  </li>
                  <li style={{ color: /[a-z]/.test(data.password) ? '#34a853' : '#5f6368' }}>
                    ✓ One lowercase letter
                  </li>
                  <li style={{ color: /\d/.test(data.password) ? '#34a853' : '#5f6368' }}>
                    ✓ One number
                  </li>
                </ul>
              </div>
              
              {errors.password && <span style={styles.errorMessage}>{errors.password}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="confirmPassword">
                Confirm Password
                <span style={styles.required}> *</span>
              </label>
              <div style={styles.inputContainer}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={data.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  disabled={loading}
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  style={styles.passwordToggle}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={styles.errorMessage}>{errors.confirmPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={loading ? styles.submitButtonLoading : styles.submitButton}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <span style={styles.buttonIcon}>📝</span>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div style={styles.loginLink}>
            <p style={styles.loginText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.loginLinkButton}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Panel - Info */}
        <div style={styles.infoPanel}>
          <div style={styles.infoContent}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>📁</span>
              <div style={styles.logoText}>
                <h1 style={styles.logoTitle}>Archive</h1>
                <p style={styles.logoSubtitle}>Management System</p>
              </div>
            </div>
            
            <div style={styles.benefits}>
              <h3 style={styles.benefitsTitle}>Benefits of Joining</h3>
              
              <div style={styles.benefit}>
                <span style={styles.benefitIcon}>🔐</span>
                <div>
                  <h4 style={styles.benefitName}>Secure Storage</h4>
                  <p style={styles.benefitDesc}>Military-grade encryption for all your files</p>
                </div>
              </div>
              
              <div style={styles.benefit}>
                <span style={styles.benefitIcon}>📊</span>
                <div>
                  <h4 style={styles.benefitName}>Smart Organization</h4>
                  <p style={styles.benefitDesc}>Advanced categorization and tagging system</p>
                </div>
              </div>
              
              <div style={styles.benefit}>
                <span style={styles.benefitIcon}>🤝</span>
                <div>
                  <h4 style={styles.benefitName}>Easy Collaboration</h4>
                  <p style={styles.benefitDesc}>Share files securely with team members</p>
                </div>
              </div>
              
              <div style={styles.benefit}>
                <span style={styles.benefitIcon}>🚀</span>
                <div>
                  <h4 style={styles.benefitName}>Fast Access</h4>
                  <p style={styles.benefitDesc}>Instant search and retrieval capabilities</p>
                </div>
              </div>
            </div>
            
            <div style={styles.securityInfo}>
              <div style={styles.securityBadge}>
                <span style={styles.securityIcon}>🛡️</span>
                <span style={styles.securityText}>Enterprise Security</span>
              </div>
              <p style={styles.securityDesc}>
                Your data is protected with industry-leading security protocols
              </p>
            </div>
            
            <div style={styles.termsNotice}>
              <p style={styles.termsText}>
                By creating an account, you agree to our{" "}
                <a href="#" style={styles.termsLink}>Terms of Service</a> and{" "}
                <a href="#" style={styles.termsLink}>Privacy Policy</a>.
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
  registerContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1100px',
    height: '700px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  formPanel: {
    flex: 1.2,
    padding: '40px',
    overflowY: 'auto',
  },
  infoPanel: {
    flex: 0.8,
    backgroundColor: '#4285F4',
    padding: '40px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
  },
  backToHome: {
    marginBottom: '20px',
  },
  backLink: {
    fontSize: '14px',
    color: '#4285F4',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  formHeader: {
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '15px',
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
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124',
    marginBottom: '8px',
  },
  required: {
    color: '#ea4335',
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
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '15px',
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
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#5f6368',
    padding: '4px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f1f3f4',
    },
  },
  passwordStrength: {
    marginTop: '12px',
  },
  strengthBar: {
    height: '4px',
    backgroundColor: '#f1f3f4',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  strengthFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  strengthInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthScore: {
    fontSize: '12px',
    color: '#5f6368',
    fontWeight: '500',
  },
  passwordRequirements: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '12px',
  },
  requirementsTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px 0',
  },
  requirementsList: {
    fontSize: '12px',
    color: '#5f6368',
    margin: 0,
    paddingLeft: '20px',
  },
  errorMessage: {
    display: 'block',
    fontSize: '12px',
    color: '#ea4335',
    marginTop: '6px',
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
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
    padding: '16px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
    opacity: 0.8,
  },
  spinner: {
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    animation: 'spin 1s linear infinite',
  },
  buttonIcon: {
    fontSize: '20px',
  },
  loginLink: {
    textAlign: 'center',
    borderTop: '1px solid #f1f3f4',
    paddingTop: '20px',
  },
  loginText: {
    fontSize: '15px',
    color: '#5f6368',
    margin: 0,
  },
  loginLinkButton: {
    color: '#4285F4',
    textDecoration: 'none',
    fontWeight: '600',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  infoContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
  benefits: {
    flex: 1,
  },
  benefitsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 24px 0',
    color: 'white',
  },
  benefit: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '24px',
  },
  benefitIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  benefitName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: 'white',
  },
  benefitDesc: {
    fontSize: '14px',
    opacity: 0.8,
    margin: 0,
    lineHeight: 1.4,
  },
  securityInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '30px',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  securityIcon: {
    fontSize: '20px',
  },
  securityText: {
    fontSize: '14px',
    fontWeight: '600',
  },
  securityDesc: {
    fontSize: '13px',
    opacity: 0.8,
    margin: 0,
  },
  termsNotice: {
    marginTop: '30px',
    textAlign: 'center',
  },
  termsText: {
    fontSize: '12px',
    opacity: 0.7,
    margin: 0,
  },
  termsLink: {
    color: 'white',
    textDecoration: 'underline',
    '&:hover': {
      opacity: 0.9,
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

export default Register;