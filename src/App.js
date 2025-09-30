import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Fs from "./Fs";
import Ut from "./Ut";
import Ts from "./Ts";


document.documentElement.style.scrollBehavior = "smooth";




function Home({ darkMode, setDarkMode }) {
  const fullTitle = "Seamless Office Automation";
  const heroTitleRef = useRef(null);
  const observerRef = useRef([]);
  const navigate = useNavigate();

  // Intersection Observer
// Intersection Observer
useEffect(() => {
  const currentElements = observerRef.current.filter(Boolean); // copy refs and remove nulls
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

  // Use currentElements instead of observerRef.current
  currentElements.forEach((el) => observer.observe(el));

  return () => {
    currentElements.forEach((el) => observer.unobserve(el));
  };
}, []);

  // Parallax effect for hero title
  useEffect(() => {
    const handleScroll = () => {
      if (heroTitleRef.current) {
        const scrollY = window.scrollY;
        heroTitleRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      {/* Navbar */}
      <header className="navbar">
        <h1 className="logo">Automation Tool</h1>
        <nav>
          <a href="#how-it-works">How It Works</a>
          <a href="#tools">Tools</a>
        </nav>

<div className="sky-toggle" onClick={() => setDarkMode(!darkMode)}>
  <div className={`sky-bg ${darkMode ? "night" : "day"}`}>
    <div className={`sun-moon ${darkMode ? "moon" : "sun"}`}>
      <span className="crater"></span>
      <span className="crater"></span>
    </div>
    <div className="cloud cloud1"></div>
    <div className="cloud cloud2"></div>
    <div className="cloud cloud3"></div>

    {/* Mountains for day mode */}
    <div className="mountains">
      <div className="mountain"></div>
      <div className="mountain"></div>
      <div className="mountain"></div>
    </div>

    {/* Shooting star for night mode */}
    <div className="shooting-star"></div>
  </div>
</div>

      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2 className="hero-title" ref={heroTitleRef}>
            {fullTitle}
          </h2>
          <p className="hero-subtitle">
            Generate and manage Functional Specs, Unit Tests, and Technical
            Specs — all in one place.
          </p>
          <button className="hero-btn">Get Started</button>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="how-it-works-section"
        ref={(el) => (observerRef.current[0] = el)}
      >
        <h2 className="section-heading">How It Works</h2>
        <div className="steps-container">
          <div className="step-card" ref={(el) => (observerRef.current[1] = el)}>
            <div className="step-icon">1</div>
            <h3>Describe Your Task</h3>
            <p>
              Simply provide a high-level description of what you need to
              document. Our tool takes it from there.
            </p>
          </div>
          <div className="step-card" ref={(el) => (observerRef.current[2] = el)}>
            <div className="step-icon">2</div>
            <h3>Generate Documents</h3>
            <p>
              Our AI processes your input and generates detailed, structured
              Functional Specs, Unit Tests, or Technical Specs.
            </p>
          </div>
          <div className="step-card" ref={(el) => (observerRef.current[3] = el)}>
            <div className="step-icon">3</div>
            <h3>Review and Export</h3>
            <p>
              Review the generated documents, make any final edits, and export
              them in your preferred format. It's that easy!
            </p>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="tools-section">
        <h2 className="section-heading">Our Tools</h2>
        <div className="tiles-container">
          <div
            id="fs"
            className="tile card"
            ref={(el) => (observerRef.current[4] = el)}
          >
            <h3>Create FS</h3>
            <p>Generate Functional Specifications effortlessly.</p>
            <button onClick={() => navigate("/fs")}>Start</button>
          </div>
          <div
            id="ut"
            className="tile card"
            ref={(el) => (observerRef.current[5] = el)}
          >
            <h3>Create UT</h3>
            <p>Design Unit Test cases with a structured flow.</p>
            <button onClick={() => navigate("/ut")}>Start</button>
          </div>
          <div
            id="ts"
            className="tile card"
            ref={(el) => (observerRef.current[6] = el)}
          >
            <h3>Create TS</h3>
            <p>Build Technical Specifications in no time.</p>
            <button onClick={() => navigate("/ts")}>Start</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          © 2025 Automation Tool | Designed for Professionals
        </p>
      </footer>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"; // read from localStorage
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode); // save on change
  }, [darkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/fs" element={<Fs darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/ut" element={<Ut darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/ts" element={<Ts darkMode={darkMode} setDarkMode={setDarkMode} />} />
      </Routes>
    </Router>
  );
}




export default App;
