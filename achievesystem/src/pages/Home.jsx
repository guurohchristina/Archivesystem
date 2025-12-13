import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [expandedService, setExpandedService] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const services = [
    {
      id: 1,
      name: "Secure File Storage",
      image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=400&h=300&fit=crop&crop=center",
      icon: "🔒",
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
      icon: "📊",
      description: "AI-powered categorization system that automatically organizes your files by subject, date, and type.",
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
      icon: "🤝",
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
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=400&h=300&fit=crop&crop=center",
      icon: "🔍",
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
      icon: "🛡️",
      name: "Bank-Level Security",
      description: "Your data is protected with the same security standards used by financial institutions."
    },
    {
      icon: "💾",
      name: "Ample Storage",
      description: "Generous storage space for all your important documents and files."
    },
    {
      icon: "⚡",
      name: "Lightning Fast",
      description: "Upload and access your files instantly with our optimized platform."
    },
    {
      icon: "📱",
      name: "Any Device Access",
      description: "Access your archives from anywhere with our responsive web platform."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "10M+", label: "Files Archived" },
    { number: "99.9%", label: "Uptime" },
    { number: "256-bit", label: "Encryption" }
  ];

  const toggleService = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  return (
    <div style={styles.container}>
      {/* Hero Section - Single column on mobile, side-by-side on desktop */}
      <section style={{
        ...styles.heroSection,
        flexDirection: getResponsiveStyle('row', 'column'),
        padding: getResponsiveStyle('80px 40px', '40px 20px'),
        gap: getResponsiveStyle('60px', '40px'),
      }}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span>🔒 Trusted Archive Platform</span>
          </div>
          <h1 style={{
            ...styles.heroTitle,
            fontSize: getResponsiveStyle('48px', '32px'),
          }}>
            Secure, and Access
            <span style={styles.highlight}> Your Files</span>
          </h1>
          
          {/* Mobile Image - Only shows on mobile, after the heading */}
          {isMobile && (
            <div style={styles.mobileHeroImage}>
              <div style={styles.mobileImagePlaceholder}>
                <div style={styles.mobileFloatingCard}>
                  <span style={styles.floatingIcon}>📄</span>
                  <span>Document.pdf</span>
                </div>
                <div style={styles.mobileFloatingCard2}>
                  <span style={styles.floatingIcon}>📊</span>
                  <span>Report.xlsx</span>
                </div>
                <div style={styles.mobileFloatingCard3}>
                  <span style={styles.floatingIcon}>🖼️</span>
                  <span>Image.png</span>
                </div>
              </div>
            </div>
          )}
          
          <p style={styles.heroDescription}>
            Professional archiving solutions for students, educators, and businesses. 
            Keep your important documents safe, organized, and accessible anywhere.
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/register">
              <button style={{
                ...styles.primaryButton,
                padding: getResponsiveStyle('14px 28px', '14px 24px'),
                fontSize: getResponsiveStyle('16px', '15px'),
                minWidth: getResponsiveStyle('180px', '100%'),
                height: getResponsiveStyle('50px', '50px'),
              }}>
                <span style={styles.buttonIcon}>🚀</span>
                Get Started Free
              </button>
            </Link>
            <Link to="/login">
              <button style={{
                ...styles.secondaryButton,
                padding: getResponsiveStyle('14px 28px', '14px 24px'),
                fontSize: getResponsiveStyle('16px', '15px'),
                minWidth: getResponsiveStyle('180px', '100%'),
                height: getResponsiveStyle('50px', '50px'),
              }}>
                <span style={styles.buttonIcon}>👤</span>
                Sign In
              </button>
            </Link>
          </div>
          <div style={{
            ...styles.trustBadges,
            flexDirection: getResponsiveStyle('row', 'column'),
            alignItems: getResponsiveStyle('center', 'flex-start'),
            gap: getResponsiveStyle('20px', '12px'),
            marginTop: getResponsiveStyle('32px', '24px'),
          }}>
            <div style={styles.trustBadge}>
              <span style={styles.trustIcon}>✅</span>
              No credit card required
            </div>
            <div style={styles.trustBadge}>
              <span style={styles.trustIcon}>🛡️</span>
              Enterprise Security
            </div>
            <div style={styles.trustBadge}>
              <span style={styles.trustIcon}>⚡</span>
              Setup in 5 minutes
            </div>
          </div>
        </div>
        
        {/* Desktop Image - Only shows on desktop */}
        {!isMobile && (
          <div style={styles.desktopHeroImage}>
            <div style={styles.desktopImagePlaceholder}>
              <div style={styles.desktopFloatingCard}>
                <span style={styles.floatingIcon}>📄</span>
                <span>Document.pdf</span>
              </div>
              <div style={styles.desktopFloatingCard2}>
                <span style={styles.floatingIcon}>📊</span>
                <span>Report.xlsx</span>
              </div>
              <div style={styles.desktopFloatingCard3}>
                <span style={styles.floatingIcon}>🖼️</span>
                <span>Image.png</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Services Section - Single column on mobile, grid on desktop */}
      <section style={{
        ...styles.servicesSection,
        padding: getResponsiveStyle('80px 40px', '40px 20px'),
      }}>
        <div style={styles.sectionHeader}>
          <h2 style={{
            ...styles.sectionTitle,
            fontSize: getResponsiveStyle('36px', '28px'),
          }}>
            How Archive System Works
          </h2>
          <p style={{
            ...styles.sectionSubtitle,
            fontSize: getResponsiveStyle('18px', '16px'),
          }}>
            Powerful features designed to simplify your file management
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: getResponsiveStyle('repeat(2, 1fr)', '1fr'),
          gap: getResponsiveStyle('30px', '20px'),
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {services.map((service) => (
            <div
              key={service.id}
              style={{
                ...styles.serviceCard,
                ...(expandedService === service.id ? styles.serviceCardExpanded : {})
              }}
              onMouseEnter={() => !isTouchDevice && !isMobile && setExpandedService(service.id)}
              onMouseLeave={() => !isTouchDevice && !isMobile && setExpandedService(null)}
              onClick={() => (isTouchDevice || isMobile) && toggleService(service.id)}
            >
              <div style={styles.serviceIconContainer}>
                <span style={styles.serviceIcon}>{service.icon}</span>
              </div>
              <h3 style={styles.serviceName}>{service.name}</h3>
              <p style={styles.serviceDescription}>{service.description}</p>
              {expandedService === service.id && (
                <div style={styles.serviceFeatures}>
                  {service.features.map((feature, index) => (
                    <div key={index} style={styles.featureItem}>
                      <span style={styles.featureIcon}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={styles.expandIndicator}>
                {expandedService === service.id ? '▲' : '▼'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section - Single column on mobile, grid on desktop */}
      <section style={{
        ...styles.featuresSection,
        padding: getResponsiveStyle('80px 40px', '40px 20px'),
      }}>
        <div style={styles.sectionHeader}>
          <h2 style={{
            ...styles.sectionTitle,
            fontSize: getResponsiveStyle('36px', '28px'),
          }}>
            Why Choose Archive System?
          </h2>
          <p style={{
            ...styles.sectionSubtitle,
            fontSize: getResponsiveStyle('18px', '16px'),
          }}>
            Everything you need for secure and efficient file management
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: getResponsiveStyle('repeat(2, 1fr)', '1fr'),
          gap: getResponsiveStyle('30px', '20px'),
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {features.map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <div style={styles.featureIconContainer}>
                <span style={styles.featureEmoji}>{feature.icon}</span>
              </div>
              <h3 style={styles.featureName}>{feature.name}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section - Single column on mobile, grid on desktop */}
      <section style={{
        ...styles.statsSection,
        padding: getResponsiveStyle('60px 40px', '40px 20px'),
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: getResponsiveStyle('repeat(4, 1fr)', 'repeat(2, 1fr)'),
          gap: getResponsiveStyle('40px', '20px'),
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={{
                ...styles.statNumber,
                fontSize: getResponsiveStyle('48px', '36px'),
              }}>
                {stat.number}
              </div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section - Single column always */}
      <section style={{
        ...styles.ctaSection,
        padding: getResponsiveStyle('80px 40px', '40px 20px'),
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: getResponsiveStyle('60px', '40px 20px'),
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{
              ...styles.ctaTitle,
              fontSize: getResponsiveStyle('36px', '28px'),
            }}>
              Ready to Secure Your Files?
            </h2>
            <p style={styles.ctaDescription}>
              Join thousands of users who trust Archive System with their 
              important documents. Start your free trial today.
            </p>
            <div style={{
              ...styles.ctaButtons,
              flexDirection: getResponsiveStyle('row', 'column'),
              gap: getResponsiveStyle('16px', '12px'),
            }}>
              <Link to="/register">
                <button style={{
                  ...styles.ctaPrimaryButton,
                  width: getResponsiveStyle('auto', '100%'),
                  padding: getResponsiveStyle('16px 32px', '14px 24px'),
                  fontSize: getResponsiveStyle('16px', '15px'),
                  height: getResponsiveStyle('50px', '50px'),
                  minWidth: getResponsiveStyle('200px', '100%'),
                }}>
                  <span style={styles.buttonIcon}>📁</span>
                  Create Your Archive
                </button>
              </Link>
              <Link to="/login">
                
                {/*
                <button style={{
                  ...styles.ctaSecondaryButton,
                  width: getResponsiveStyle('auto', '100%'),
                  padding: getResponsiveStyle('16px 32px', '14px 24px'),
                  fontSize: getResponsiveStyle('16px', '15px'),
                  height: getResponsiveStyle('50px', '50px'),
                  minWidth: getResponsiveStyle('200px', '100%'),
                }}>
                  <span style={styles.buttonIcon}>👥</span>
                  Schedule Demo
                </button>*/}
                
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Single column on mobile, grid on desktop */}
      <footer style={{
        ...styles.footer,
        padding: getResponsiveStyle('60px 40px 30px', '40px 20px 20px'),
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: getResponsiveStyle('repeat(auto-fit, minmax(250px, 1fr))', '1fr'),
          gap: getResponsiveStyle('40px', '30px'),
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={styles.footerSection}>
            <div style={styles.footerLogo}>
              <span style={styles.logoIcon}>📁</span>
              <div>
                <h3 style={styles.footerTitle}>Archive System</h3>
                <p style={styles.footerTagline}>Secure File Management</p>
              </div>
            </div>
            <p style={styles.footerText}>
              The trusted archiving platform for students, educators, and businesses worldwide.
            </p>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.footerHeading}>Quick Links</h4>
            <ul style={styles.footerLinks}>
              <li><Link to="/" style={styles.footerLink}>Home</Link></li>
              <li><Link to="/features" style={styles.footerLink}>Features</Link></li>
              <li><Link to="/pricing" style={styles.footerLink}>Pricing</Link></li>
              <li><Link to="/about" style={styles.footerLink}>About</Link></li>
            </ul>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.footerHeading}>Support</h4>
            <ul style={styles.footerLinks}>
              <li><Link to="/help" style={styles.footerLink}>Help Center</Link></li>
              <li><Link to="/docs" style={styles.footerLink}>Documentation</Link></li>
              <li><Link to="/contact" style={styles.footerLink}>Contact</Link></li>
              <li><Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link></li>
            </ul>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.footerHeading}>Connect</h4>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}>🐦</a>
              <a href="#" style={styles.socialLink}>💼</a>
              <a href="#" style={styles.socialLink}>📘</a>
              <a href="#" style={styles.socialLink}>📷</a>
            </div>
            <p style={styles.contactEmail}>support@archivesystem.com</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2024 Archive System. All rights reserved. Empowering secure file management worldwide.</p>
        </div>
      </footer>
    </div>
  );
};

// Helper function for responsive styles
const getResponsiveStyle = (desktopValue, mobileValue) => {
  const isMobile = window.innerWidth < 768;
  return isMobile ? mobileValue : desktopValue;
};

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#202124',
    lineHeight: 1.6,
    overflowX: 'hidden',
  },
  heroSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroContent: {
    flex: 1,
  },
  heroBadge: {
    display: 'inline-block',
    backgroundColor: '#f0f7ff',
    color: '#4285F4',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
  },
  heroTitle: {
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '20px',
    color: '#202124',
  },
  highlight: {
    color: '#4285F4',
  },
  heroDescription: {
    fontSize: '18px',
    color: '#5f6368',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  ctaButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#3367d6',
      transform: 'translateY(-2px)',
    },
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#4285F4',
    border: '2px solid #4285F4',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f0f7ff',
      transform: 'translateY(-2px)',
    },
  },
  buttonIcon: {
    fontSize: '18px',
  },
  trustBadges: {
    display: 'flex',
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#5f6368',
  },
  trustIcon: {
    fontSize: '16px',
  },
  
  // Mobile Hero Image
  mobileHeroImage: {
    margin: '24px 0 32px 0',
    width: '100%',
  },
  mobileImagePlaceholder: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px dashed #dadce0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFloatingCard: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    backgroundColor: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  mobileFloatingCard2: {
    position: 'absolute',
    top: '60px',
    right: '15px',
    backgroundColor: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  mobileFloatingCard3: {
    position: 'absolute',
    bottom: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  
  // Desktop Hero Image
  desktopHeroImage: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopImagePlaceholder: {
    position: 'relative',
    width: '400px',
    height: '300px',
    backgroundColor: '#f8f9fa',
    borderRadius: '16px',
    border: '2px dashed #dadce0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopFloatingCard: {
    position: 'absolute',
    top: '20px',
    left: '-40px',
    backgroundColor: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  desktopFloatingCard2: {
    position: 'absolute',
    top: '120px',
    right: '-30px',
    backgroundColor: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  desktopFloatingCard3: {
    position: 'absolute',
    bottom: '30px',
    left: '30px',
    backgroundColor: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  floatingIcon: {
    fontSize: '20px',
  },
  
  // Services Section
  servicesSection: {
    backgroundColor: '#f8f9fa',
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 60px',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#202124',
    marginBottom: '16px',
  },
  sectionSubtitle: {
    color: '#5f6368',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    position: 'relative',
    cursor: 'pointer',
    border: '1px solid #f1f3f4',
  },
  serviceCardExpanded: {
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    borderColor: '#4285F4',
    transform: 'translateY(-5px)',
  },
  serviceIconContainer: {
    width: '60px',
    height: '60px',
    backgroundColor: '#f0f7ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  serviceIcon: {
    fontSize: '28px',
  },
  serviceName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '12px',
  },
  serviceDescription: {
    fontSize: '15px',
    color: '#5f6368',
    marginBottom: '16px',
  },
  serviceFeatures: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f3f4',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#5f6368',
  },
  featureIcon: {
    color: '#34a853',
    fontWeight: 'bold',
  },
  expandIndicator: {
    position: 'absolute',
    top: '32px',
    right: '32px',
    color: '#4285F4',
    fontSize: '14px',
  },
  
  // Features Section
  featuresSection: {
    backgroundColor: 'white',
  },
  featureCard: {
    textAlign: 'center',
    padding: '32px 24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    },
  },
  featureIconContainer: {
    width: '70px',
    height: '70px',
    backgroundColor: '#e8f0fe',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  featureEmoji: {
    fontSize: '32px',
  },
  featureName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '12px',
  },
  featureDescription: {
    fontSize: '14px',
    color: '#5f6368',
  },
  
  // Stats Section
  statsSection: {
    backgroundColor: '#4285F4',
    color: 'white',
  },
  statCard: {
    padding: '24px',
  },
  statNumber: {
    fontWeight: '700',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '16px',
    opacity: 0.9,
  },
  
  // CTA Section
  ctaSection: {
    backgroundColor: '#f8f9fa',
  },
  ctaTitle: {
    fontWeight: '700',
    color: '#202124',
    marginBottom: '16px',
  },
  ctaDescription: {
    fontSize: '18px',
    color: '#5f6368',
    marginBottom: '32px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap:'12px'
  },
  ctaPrimaryButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#3367d6',
      transform: 'translateY(-2px)',
    },
  },
  ctaSecondaryButton: {
    backgroundColor: 'transparent',
    color: '#4285F4',
    border: '2px solid #4285F4',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f0f7ff',
      transform: 'translateY(-2px)',
    },
  },
  
  // Footer
  footer: {
    backgroundColor: '#202124',
    color: 'white',
  },
  footerSection: {
    marginBottom: '20px',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  footerTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  footerTagline: {
    fontSize: '14px',
    opacity: 0.8,
  },
  footerText: {
    fontSize: '14px',
    opacity: 0.7,
    lineHeight: 1.6,
  },
  footerHeading: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  footerLinks: {
    listStyle: 'none',
    padding: 0,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '14px',
    marginBottom: '12px',
    display: 'block',
    transition: 'color 0.2s',
    '&:hover': {
      color: 'white',
    },
  },
  socialLinks: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  socialLink: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    '&:hover': {
      color: 'white',
    },
  },
  contactEmail: {
    fontSize: '14px',
    opacity: 0.7,
  },
  footerBottom: {
    textAlign: 'center',
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    fontSize: '14px',
    opacity: 0.6,
  },
};

export default Home;