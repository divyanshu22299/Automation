import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Lenis from "lenis";

function Root() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.2,
      smoothTouch: true,
    });

    function raf(time) {
      lenis.raf(time);

      // Parallax effect
      const scrollY = window.scrollY;
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed")) || 0.5;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });

      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

reportWebVitals();
