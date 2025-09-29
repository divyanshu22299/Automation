import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./App.css";

function Layout({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="navbar">
        <h1 className="logo" onClick={() => navigate("/")}>Automation Tool</h1>
        <nav>
          <a href="#how-it-works">How It Works</a>
          <a href="#tools">Tools</a>
        </nav>

        {/* Dark Mode Toggle */}
        <div className="sky-toggle" onClick={() => setDarkMode(!darkMode)}>
          <div className={`sky-bg ${darkMode ? "night" : "day"}`}>
            <div className={`sun-moon ${darkMode ? "moon" : "sun"}`}>
              <span className="crater"></span>
              <span className="crater"></span>
            </div>
            <div className="cloud cloud1"></div>
            <div className="cloud cloud2"></div>
            <div className="cloud cloud3"></div>
          </div>
        </div>
      </header>

      {/* This is where the current page content will render */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
