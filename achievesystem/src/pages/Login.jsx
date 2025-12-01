/*import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("Logged in!");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="page">
      <h1>Login</h1>

      <form className="form" onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button>Login</button>
      </form>
    </div>
  );
};

export default Login;*/

/*

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // to redirect after login

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload

    const success = login(formData.email, formData.password); // calls hardcoded login
    if (success) {
      alert("Login successful!"); // optional
      navigate("/dashboard"); // redirect to dashboard
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}*/


import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // Navigation will happen automatically due to the useEffect above
      // because isAuthenticated will become true
    } catch (error) {
      alert(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Quick admin login for testing
  const quickAdminLogin = () => {
    setFormData({
      email: "admin@archive.com",
      password: "admin123"
    });
  };

  // Quick user login for testing
  const quickUserLogin = () => {
    setFormData({
      email: "test@example.com",
      password: "password123"
    });
  };

  return (
    <div className="page">
      <h1>Login</h1>

      <form className="form" onSubmit={submit}>
        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={loading}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            disabled={loading}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Quick login buttons for testing */}
      <div className="quick-login-buttons">
        <h3>Quick Test Logins:</h3>
        <button 
          onClick={quickAdminLogin}
          style={{ margin: "5px" }}
        >
          Admin Login
        </button>
        <button 
          onClick={quickUserLogin}
          style={{ margin: "5px" }}
        >
          Test User Login
        </button>
        <p>Admin: admin@archive.com / admin123</p>
      </div>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;