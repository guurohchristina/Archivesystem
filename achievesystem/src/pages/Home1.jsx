/*const Home = () => {
  return (
    <div className="page">
      <h1>Welcome to Achieve System</h1>
      <p>Your academic record and achievements hub.</p>
    </div>
  );
};

export default Home; */


/*const Home = () => {
  return (
    <div className="page" style={{ fontFamily: "Inter, sans-serif" }}>
      
      
      <section
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#ffffff",
        }}
      >
        <h1 style={{ fontSize: "2.8rem", marginBottom: "10px", color: "#1e293b" }}>
          Welcome to Achieve System
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#475569", maxWidth: "600px", margin: "0 auto" }}>
          Your secure hub for storing, managing, and accessing academic files and documents.
        </p>

        <button
          style={{
            marginTop: "30px",
            padding: "14px 28px",
            background: "#1e293b",
            borderRadius: "8px",
            border: "none",
            color: "white",
            fontSize: "1.1rem",
            cursor: "pointer",
            fontWeight: "600",
          }}
          onClick={() => (window.location.href = "/register")}
        >
          Start Uploading
        </button>
      </section>

      
      <section
        style={{
          padding: "50px 20px",
          background: "#f8fafc",
          marginTop: "30px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            color: "#1e293b",
            marginBottom: "40px",
          }}
        >
          Why Use Achieve System?
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          
          <div
            style={{
              width: "280px",
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#1e293b" }}>
              Secure File Storage
            </h3>
            <p style={{ color: "#475569" }}>
              Keep all your academic documents safe with modern file protection.
            </p>
          </div>

        
          <div
            style={{
              width: "280px",
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#1e293b" }}>
              Easy File Management
            </h3>
            <p style={{ color: "#475569" }}>
              Upload, access, organize, and categorize your files easily.
            </p>
          </div>

          
          <div
            style={{
              width: "280px",
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#1e293b" }}>
              Access Anytime
            </h3>
            <p style={{ color: "#475569" }}>
              Retrieve your documents whenever you need them, on any device.
            </p>
          </div>
        </div>
      </section>

      
      <footer
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#1e293b",
          color: "white",
          textAlign: "center",
        }}
      >
        <p>© 2025 Achieve System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
*/


/*const Home = () => {
  const [expandedService, setExpandedService] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const services = [
    {
      id: 1,
      name: "Secure File Storage",
      icon: "fas fa-shield-alt",
      description: "Military-grade encryption for your academic documents and files. Rest easy knowing your data is protected with end-to-end encryption.",
      features: [
        "256-bit AES encryption",
        "Automatic backup",
        "Secure access controls",
        "Cross-platform availability"
      ]
    },
    {
      id: 2,
      name: "Smart Organization",
      icon: "fas fa-folder-tree",
      description: "AI-powered categorization system that automatically organizes your academic files by subject, date, and type.",
      features: [
        "AI auto-categorization",
        "Smart search",
        "Custom folders",
        "Quick filters"
      ]
    },
    {
      id: 3,
      name: "Collaborative Features",
      icon: "fas fa-users",
      description: "Share files securely with classmates and instructors while maintaining strict access controls.",
      features: [
        "Group workspaces",
        "Role-based permissions",
        "Version history",
        "Activity tracking"
      ]
    },
    {
      id: 4,
      name: "Advanced Search",
      icon: "fas fa-search",
      description: "Find any academic file in seconds with our powerful search engine. Search by content, course, or metadata.",
      features: [
        "Full-text search",
        "Course filtering",
        "Date ranges",
        "Saved searches"
      ]
    }
  ];

  const features = [
    {
      icon: "fas fa-lock",
      name: "Bank-Level Security",
      description: "Your academic data is protected with the same security standards used by educational institutions."
    },
    {
      icon: "fas fa-infinity",
      name: "Ample Storage",
      description: "Generous storage space for all your academic materials, assignments, and research documents."
    },
    {
      icon: "fas fa-bolt",
      name: "Lightning Fast",
      description: "Upload and access your academic files instantly with our optimized platform."
    },
    {
      icon: "fas fa-mobile-alt",
      name: "Any Device Access",
      description: "Access your academic archives from anywhere with our responsive web platform."
    }
  ];

  const toggleService = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  return (
    <div className="page" style={{ fontFamily: "Inter, sans-serif" }}>
      
      <header style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "1.5rem 2rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <nav style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#1e293b"
          }}>
            <i className="fas fa-box-archive"></i>
            Achieve System
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button style={{
              background: "#1e293b",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              Sign In
            </button>
            <button style={{
              background: "transparent",
              color: "#1e293b",
              border: "2px solid #1e293b",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              Get Started Free
            </button>
          </div>
        </nav>
      </header>

      
      <section style={{
        textAlign: "center",
        padding: "6rem 2rem",
        background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: 700, 
            marginBottom: "1.5rem", 
            color: "#1e293b", 
            lineHeight: "1.1" 
          }}>
            Organize, Secure, and Access Your Academic Files
          </h1>
          <p style={{ 
            fontSize: "1.25rem", 
            color: "#64748b", 
            marginBottom: "2.5rem", 
            lineHeight: "1.6" 
          }}>
            Achieve System provides secure archiving solutions for students and educators. Keep your important academic files safe, organized, and accessible.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{
              background: "#1e293b",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              Start Your Free Trial
            </button>
            <button style={{
              background: "transparent",
              color: "#1e293b",
              border: "2px solid #1e293b",
              padding: "1rem 2rem",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              <i className="fas fa-play-circle"></i> Watch Demo
            </button>
          </div>
        </div>
      </section>

      
      <section style={{
        padding: "4rem 2rem",
        background: "#ffffff",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "3rem",
          color: "#1e293b"
        }}>
          How Achieve System Works
        </h2>
        <div style={{
          display: "flex",
          gap: "1.5rem",
          overflowX: "auto",
          padding: "1rem 0"
        }}>
          {services.map((service) => (
            <div
              key={service.id}
              style={{
                minWidth: "300px",
                background: expandedService === service.id ? "#ffffff" : "#f8fafc",
                border: `1px solid ${expandedService === service.id ? "#94a3b8" : "#e2e8f0"}`,
                borderRadius: "12px",
                padding: "2rem",
                transition: "all 0.3s ease",
                cursor: "pointer",
                boxShadow: expandedService === service.id ? "0 8px 25px rgba(0, 0, 0, 0.15)" : "none",
                transform: expandedService === service.id ? "translateY(-4px)" : "none"
              }}
              onMouseEnter={() => !isTouchDevice && setExpandedService(service.id)}
              onMouseLeave={() => !isTouchDevice && setExpandedService(null)}
              onClick={() => isTouchDevice && toggleService(service.id)}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem"
              }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "10px",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  color: "#475569"
                }}>
                  <i className={service.icon}></i>
                </div>
                <div style={{
                  color: "#64748b",
                  fontSize: "0.9rem",
                  transition: "transform 0.3s ease",
                  transform: expandedService === service.id ? "rotate(180deg)" : "none"
                }}>
                  <i className="fas fa-chevron-down"></i>
                  {isTouchDevice && " (Tap to expand)"}
                </div>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: "0.5rem"
              }}>
                {service.name}
              </h3>
              <div style={{
                color: "#64748b",
                lineHeight: "1.5",
                maxHeight: expandedService === service.id ? "200px" : "0",
                overflow: "hidden",
                transition: "max-height 0.3s ease"
              }}>
                <p>{service.description}</p>
                <ul style={{
                  listStyle: "none",
                  marginTop: "1rem",
                  color: "#64748b"
                }}>
                  {service.features.map((feature, index) => (
                    <li key={index} style={{
                      marginBottom: "0.5rem",
                      paddingLeft: "1rem",
                      position: "relative"
                    }}>
                      <span style={{
                        position: "absolute",
                        left: 0,
                        color: "#10b981",
                        fontWeight: "bold"
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      
      <section style={{
        padding: "4rem 2rem",
        background: "#f1f5f9"
      }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "3rem",
          color: "#1e293b"
        }}>
          Why Choose Achieve System?
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
              transition: "all 0.3s ease"
            }}>
              <div style={{
                width: "70px",
                height: "70px",
                borderRadius: "12px",
                background: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#475569"
              }}>
                <i className={feature.icon}></i>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#1e293b"
              }}>
                {feature.name}
              </h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      
      <section style={{
        padding: "4rem 2rem",
        background: "#ffffff"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>50K+</div>
            <div style={{ color: "#64748b", fontSize: "1.1rem" }}>Students & Educators</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>10M+</div>
            <div style={{ color: "#64748b", fontSize: "1.1rem" }}>Files Archived</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>99.9%</div>
            <div style={{ color: "#64748b", fontSize: "1.1rem" }}>Uptime</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>256-bit</div>
            <div style={{ color: "#64748b", fontSize: "1.1rem" }}>Encryption</div>
          </div>
        </div>
      </section>

    
      <section style={{
        padding: "6rem 2rem",
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        textAlign: "center",
        color: "white"
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem"
          }}>
            Ready to Secure Your Academic Files?
          </h2>
          <p style={{
            fontSize: "1.25rem",
            marginBottom: "2.5rem",
            color: "#cbd5e1",
            lineHeight: "1.6"
          }}>
            Join thousands of students and educators who trust Achieve System with their important academic documents. Start with 15GB free.
          </p>
          <button style={{
            background: "white",
            color: "#1e293b",
            border: "none",
            padding: "1rem 2rem",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "1.1rem",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}>
            Create Your Archive Now
          </button>
        </div>
      </section>

      
      <footer style={{
        background: "#1e293b",
        color: "white",
        padding: "3rem 2rem"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem"
        }}>
          <div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>Achieve System</h3>
            <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
              The trusted academic archiving platform for students and educators worldwide.
            </p>
          </div>
          <div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>Product</h3>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: "0.5rem" }}><a href="#features" style={{ color: "#cbd5e1", textDecoration: "none" }}>Features</a></li>
              <li style={{ marginBottom: "0.5rem" }}><a href="#pricing" style={{ color: "#cbd5e1", textDecoration: "none" }}>Pricing</a></li>
              <li style={{ marginBottom: "0.5rem" }}><a href="#security" style={{ color: "#cbd5e1", textDecoration: "none" }}>Security</a></li>
            </ul>
          </div>
          <div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>Support</h3>
            <ul style={{ listStyle: "none" }}>
              <li style={{ marginBottom: "0.5rem" }}><a href="#help" style={{ color: "#cbd5e1", textDecoration: "none" }}>Help Center</a></li>
              <li style={{ marginBottom: "0.5rem" }}><a href="#docs" style={{ color: "#cbd5e1", textDecoration: "none" }}>Documentation</a></li>
              <li style={{ marginBottom: "0.5rem" }}><a href="#contact" style={{ color: "#cbd5e1", textDecoration: "none" }}>Contact</a></li>
            </ul>
          </div>
        </div>
        <div style={{
          textAlign: "center",
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #334155",
          color: "#94a3b8"
        }}>
          <p>© 2024 Achieve System. All rights reserved. Empowering education through secure archiving.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;*/



import React, { useState, useEffect } from 'react';

const Home = () => {
  const [expandedService, setExpandedService] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const services = [
    {
      id: 1,
      name: "Secure File Storage",
      image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=400&h=300&fit=crop&crop=center",
      description: "Military-grade encryption for your documents and files. Rest easy knowing your data is protected with end-to-end encryption.",
      features: [
        "256-bit AES encryption",
        "Automatic backup",
        "Secure access controls",
        "Cross-platform availability"
      ]
    },
    {
      id: 2,
      name: "Smart Organization",
     image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=400&h=300&fit=crop&crop=center",

      description: "AI-powered categorization system that automatically organizes your academic files by subject, date, and type.",
      features: [
        "AI auto-categorization",
        "Smart search",
        "Custom folders",
        "Quick filters"
      ]
    },
    {
      id: 3,
      name: "Collaborative Features",
       image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=400&h=300&fit=crop&crop=center",
      description: "Share files securely with colleagues while maintaining strict access controls.",
      features: [
        "Group workspaces",
        "Role-based permissions",
        "Version history",
        "Activity tracking"
      ]
    },
    {
      id: 4,
      name: "Advanced Search",
      icon: "fas fa-search",
      description: "Find any document or file in seconds with our powerful search engine. Search by content, course, or metadata.",
      features: [
        "Full-text search",
        "Course filtering",
        "Date ranges",
        "Saved searches"
      ]
    }
  ];

  const features = [
    {
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=300&h=200&fit=crop&crop=center",

      name: "Bank-Level Security",
      description: "Your  data is protected with the same security standards used by educational institutions."
    },
    {
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=300&h=200&fit=crop&crop=center",

      name: "Ample Storage",
      description: "Generous storage space for all your  documents."
    },
    {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=300&h=200&fit=crop&crop=center",
      name: "Lightning Fast",
      description: "Upload and access your  files instantly with our optimized platform."
    },
    {
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&w=300&h=200&fit=crop&crop=center",
      name: "Any Device Access",
      description: "Access your academic archives from anywhere with our responsive web platform."
    }
  ];

  const toggleService = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  return (
    <div className="home-container">
      

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Organize, Secure, and Access Your Files</h1>
          <p>
            Archieve System  archiving solutions for students, educators, businesses etc. 
            Keep your important documents safe, organized, and accessible.
          </p>
          <div className="cta-buttons">
            <button className="primary-cta">
              Start uploading
            </button>
            
          </div>
        </div>
      </section>

      {/* Services Section - Horizontal Expandable */}
      <section className="services-section">
        <h2>How Archieve System Works</h2>
        <div className="services-horizontal">
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-card ${expandedService === service.id ? 'expanded' : ''}`}
              onMouseEnter={() => !isTouchDevice && setExpandedService(service.id)}
              onMouseLeave={() => !isTouchDevice && setExpandedService(null)}
              onClick={() => isTouchDevice && toggleService(service.id)}
            >
              <div className="service-header">
              <  img 
        src={service.image} 
        alt={service.name}
        className="service-image"
    />
                <div className="expand-indicator">
                  <i className="fas fa-chevron-down"></i>
                  
                </div>
              </div>
              <h3 className="service-name">{service.name}</h3>
              <div className="service-description">
                <p>{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Archieve System?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <img 
                      src={feature.image} 
                              alt={feature.name}
                                      className="feature-image"
                                          />
              <h3 className="feature-name">{feature.name}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10M+</div>
            <div className="stat-label">Files Archived</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">256-bit</div>
            <div className="stat-label">Encryption</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Secure Your Files?</h2>
          <p>
            Join thousands of Users who trust Archieve System with their 
            importantdocuments.
          </p><br></br>
          <button className="cta-button">
            Create Your Archive Now
          </button>
        </div>
      </section>

      {/* Footer */}
       <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Achieve System</h3>
            <p style={styles.footerText}>
              The trusted  archiving platform for students, educators, businesses worldwide.
            </p>
          </div>

          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>Support</h3>
            <ul style={styles.footerLinks}>
              <li><a href="#help" style={styles.footerLink}>Help Center</a></li>
              <li><a href="#docs" style={styles.footerLink}>Documentation</a></li>
              <li><a href="#contact" style={styles.footerLink}>Contact</a></li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2024 Achieve System. All rights reserved. Empowering education through secure archiving.</p>
        </div>
      </footer>
    </div>
  );
};

// Styles object
const styles = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    minHeight: '100vh'
  },
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "1.5rem 2rem",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#1e293b"
  },
  logoIcon: {
    fontSize: "2rem"
  },
  navActions: {
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  signInBtn: {
    background: "#1e293b",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  signUpBtn: {
    background: "transparent",
    color: "#1e293b",
    border: "2px solid #1e293b",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  hero: {
    textAlign: "center",
    padding: "6rem 2rem",
    background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)"
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto"
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
    color: "#1e293b",
    lineHeight: "1.1"
  },
  heroDescription: {
    fontSize: "1.25rem",
    color: "#64748b",
    marginBottom: "2.5rem",
    lineHeight: "1.6"
  },
  ctaButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  primaryCta: {
    background: "#1e293b",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  secondaryCta: {
    background: "transparent",
    color: "#1e293b",
    border: "2px solid #1e293b",
    padding: "1rem 2rem",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  services: {
    padding: "4rem 2rem",
    background: "#ffffff",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: "3rem",
    color: "#1e293b"
  },
  servicesHorizontal: {
    display: "flex",
    gap: "1.5rem",
    overflowX: "auto",
    padding: "1rem 0"
  },
  serviceCard: {
    minWidth: "300px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "2rem",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },
  serviceCardExpanded: {
    background: "#ffffff",
    borderColor: "#94a3b8",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-4px)"
  },
  serviceHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem"
  },
  serviceIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    color: "#475569"
  },
  expandIndicator: {
    color: "#64748b",
    fontSize: "0.9rem",
    transition: "transform 0.3s ease"
  },
  serviceName: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: "0.5rem"
  },
  serviceDescription: {
    color: "#64748b",
    lineHeight: "1.5",
    overflow: "hidden",
    transition: "max-height 0.3s ease"
  },
  serviceFeatures: {
    listStyle: "none",
    marginTop: "1rem",
    color: "#64748b"
  },
  featureItem: {
    marginBottom: "0.5rem",
    paddingLeft: "1rem",
    position: "relative"
  },
  featureCheck: {
    position: "absolute",
    left: 0,
    color: "#10b981",
    fontWeight: "bold"
  },
  features: {
    padding: "4rem 2rem",
    background: "#f1f5f9"
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  featureCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "2rem",
    textAlign: "center",
    transition: "all 0.3s ease"
  },
  featureIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "12px",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
    fontSize: "1.5rem",
    color: "#475569"
  },
  featureName: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "#1e293b"
  },
  featureDescription: {
    color: "#64748b",
    lineHeight: "1.6"
  },
  stats: {
    padding: "4rem 2rem",
    background: "#ffffff"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  statItem: {
    textAlign: "center"
  },
  statNumber: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "0.5rem"
  },
  statLabel: {
    color: "#64748b",
    fontSize: "1.1rem"
  },
  ctaSection: {
    padding: "6rem 2rem",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    textAlign: "center",
    color: "white"
  },
  ctaContent: {
    maxWidth: "600px",
    margin: "0 auto"
  },
  ctaTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "1.5rem"
  },
  ctaDescription: {
    fontSize: "1.25rem",
    marginBottom: "2.5rem",
    color: "#cbd5e1",
    lineHeight: "1.6"
  },
  ctaButton: {
    background: "white",
    color: "#1e293b",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  footer: {
    background: "#1e293b",
    color: "white",
    padding: "3rem 2rem"
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem"
  },
  footerSection: {
    marginBottom: "1rem"
  },
  footerTitle: {
    marginBottom: "1rem",
    fontSize: "1.1rem",
    fontWeight: 600
  },
  footerText: {
    color: "#cbd5e1",
    lineHeight: "1.6"
  },
  footerLinks: {
    listStyle: "none"
  },
  footerLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    transition: "color 0.3s ease",
    display: "block",
    marginBottom: "0.5rem"
  },
  footerBottom: {
    textAlign: "center",
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid #334155",
    color: "#94a3b8"
  }
};

export default Home;