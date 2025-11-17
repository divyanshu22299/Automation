import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Fs from "./Fs";
import Ut from "./Ut";
import Ts from "./Ts";

document.documentElement.style.scrollBehavior = "smooth";

function Home() {
  const fullTitle = "DocAI";
  const heroTitleRef = useRef(null);
  const observerRef = useRef([]);
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  // Intersection Observer
  useEffect(() => {
    const currentElements = observerRef.current.filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    currentElements.forEach((el) => observer.observe(el));

    return () => {
      currentElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Enhanced parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroTitleRef.current) {
        const scrollY = window.scrollY;
        heroTitleRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
      }
      
      // Parallax for particles
      const particles = document.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        const speed = 0.5 + (index * 0.1);
        particle.style.transform = `translateY(${window.scrollY * speed}px)`;
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Staggered animations for hero content
  useEffect(() => {
    // Trigger animations in sequence
    setTimeout(() => setTitleVisible(true), 300);
    setTimeout(() => setSubtitleVisible(true), 600);
    setTimeout(() => setDescriptionVisible(true), 900);
    setTimeout(() => setButtonsVisible(true), 1200);
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo-container">
            <h1 className="logo">Doc<span className="logo-accent">AI</span></h1>
          </div>
          
          <nav className="nav-links">
            <a href="#how-it-works" className="nav-item">How It Works</a>
            <a href="#tools" className="nav-item">Tools</a>
            <button onClick={() => navigate("/fs")} className="nav-item btn-nav">FS</button>
            <button onClick={() => navigate("/ut")} className="nav-item btn-nav">UT</button>
            <button onClick={() => navigate("/ts")} className="nav-item btn-nav">TS</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
        </div>
        <div className="hero-content">
          <h1 className={`hero-title ${titleVisible ? 'visible' : ''}`} ref={heroTitleRef}>
            {fullTitle.split('').map((letter, index) => (
              <span key={index} className="title-letter" style={{animationDelay: `${index * 0.05}s`}}>
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </h1>
          <h2 className={`hero-subtitle ${subtitleVisible ? 'visible' : ''}`}>
            Intelligent Documentation Automation
          </h2>
          <p className={`hero-description ${descriptionVisible ? 'visible' : ''}`}>
            Generate Functional Specs, Unit Tests, and Technical Specifications effortlessly.
          </p>
          <div className={`hero-buttons ${buttonsVisible ? 'visible' : ''}`}>
            <button onClick={() => navigate("/fs")} className="hero-btn primary">Get Started</button>
            <a href="#how-it-works" className="hero-btn secondary">Learn More</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-heading">Powerful Features</h2>
          <p className="section-subtitle">Everything you need for professional documentation</p>
        </div>
        <div className="features-container">
          <div className="feature-card" ref={(el) => (observerRef.current[0] = el)}>
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3>Stable Generation</h3>
            <p>Leverage advanced algorithms to create comprehensive documentation tailored to your needs.</p>
          </div>
          <div className="feature-card" ref={(el) => (observerRef.current[1] = el)}>
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Lightning Fast</h3>
            <p>Generate complex documentation in seconds, not hours. Save valuable time for more important tasks.</p>
          </div>
          <div className="feature-card" ref={(el) => (observerRef.current[2] = el)}>
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Enterprise Grade</h3>
            <p>Built with security and reliability in mind. Perfect for teams of all sizes.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="how-it-works-section"
        ref={(el) => (observerRef.current[3] = el)}
      >
        <div className="section-header">
          <h2 className="section-heading">How It Works</h2>
          <p className="section-subtitle">Simple steps to generate professional documentation</p>
        </div>
        <div className="steps-container">
          <div className="step-card" ref={(el) => (observerRef.current[4] = el)}>
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Input Your Requirements</h3>
              <p>Provide a brief description of what you need to document. Our AI understands context and requirements.</p>
            </div>
          </div>
          <div className="step-card" ref={(el) => (observerRef.current[5] = el)}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>AI Processing</h3>
              <p>Our advanced AI analyzes your input and generates comprehensive, structured documentation tailored to your needs.</p>
            </div>
          </div>
          <div className="step-card" ref={(el) => (observerRef.current[6] = el)}>
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Review & Export</h3>
              <p>Review the generated documents, make any final edits, and export in your preferred format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="tools-section">
        <div className="section-header">
          <h2 className="section-heading">Our Tools</h2>
          <p className="section-subtitle">Choose the documentation you need</p>
        </div>
        <div className="tiles-container">
          <div id="fs" className="tile card" ref={(el) => (observerRef.current[7] = el)}>
            <div className="tile-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Functional Specs</h3>
            <p>Generate detailed Functional Specifications with structured content and professional formatting.</p>
            <button onClick={() => navigate("/fs")} className="tile-btn">Start Creating</button>
          </div>
          <div id="ut" className="tile card" ref={(el) => (observerRef.current[8] = el)}>
            <div className="tile-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
            </div>
            <h3>Unit Tests</h3>
            <p>Design comprehensive Unit Test cases with structured flow and detailed scenarios.</p>
            <button onClick={() => navigate("/ut")} className="tile-btn">Start Creating</button>
          </div>
          <div id="ts" className="tile card" ref={(el) => (observerRef.current[9] = el)}>
            <div className="tile-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h3>Technical Specs</h3>
            <p>Build comprehensive Technical Specifications with detailed architecture and implementation details.</p>
            <button onClick={() => navigate("/ts")} className="tile-btn">Start Creating</button>
          </div>
        </div>
      </section>

      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to streamline your documentation process?</h2>
          <p>Join thousands of professionals who are saving time with our automation tools.</p>
          <button onClick={() => navigate("/fs")} className="cta-btn">Get Started Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h3>Doc<span className="logo-accent">AI</span></h3>
            <p>Professional documentation made simple.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/div_yanshu__?igsh=MjJmejZxOHdtbGJq" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/divyanshu-singh-chouhan-0b42b7303/" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Tools</h4>
              <a href="#tools">Functional Specs</a>
              <a href="#tools">Unit Tests</a>
              <a href="#tools">Technical Specs</a>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="#contacts" onClick={(e) => { e.preventDefault(); setShowContactModal(true); }}>Contact</a>
              <a href="#how-it-works">How It Works</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-text">© 2025 DocAI | Designed By Divyanshu Singh Chouhan</p>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Information</h3>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="contact-card">
                <div className="contact-avatar">
                  <div className="avatar-initials">DSC</div>
                </div>
                <h4>Divyanshu Singh Chouhan</h4>
                <p>Founder & Developer</p>
                <div className="contact-details">
                  <div className="contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <a href="mailto:divyanshusingh2229@gmail.com">divyanshusingh2229@gmail.com</a>
                  </div>
                  <div className="contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <a href="tel:+918949795981">+91 8949795981</a>
                  </div>
                </div>
                <div className="social-links-modal">
                  <a href="https://www.instagram.com/div_yanshu__?igsh=MjJmejZxOHdtbGJq" target="_blank" rel="noopener noreferrer" className="social-link-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/in/divyanshu-singh-chouhan-0b42b7303/" target="_blank" rel="noopener noreferrer" className="social-link-modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fs" element={<Fs />} />
        <Route path="/ut" element={<Ut />} />
        <Route path="/ts" element={<Ts />} />
      </Routes>
    </Router>
  );
}

export default App;