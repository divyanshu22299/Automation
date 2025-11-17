import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileExport,
  FaRegFileAlt,
  FaTrash,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import "./Fs.css";

window.Buffer = require("buffer/").Buffer;

export default function Fs({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Technical Specification");

  const fieldNames = [
    "Client name",
    "Module",
    "FS document number",
    "TS document number",
    "Date",
    "RICEFW typed",
    "TR Number",
    "TR Description",
    "TR Date",
    "Complexity of Object",
    "Program Name",
    "Package",
    "Code Images",
    "Change description",
  ];

  const [fields, setFields] = useState(() => {
    const init = Array(fieldNames.length).fill("");
    const dateIdx = fieldNames.indexOf("Date");
    if (dateIdx !== -1) init[dateIdx] = new Date().toISOString().split("T")[0];
    
    const trDateIdx = fieldNames.indexOf("TR Date");
    if (trDateIdx !== -1) init[trDateIdx] = new Date().toISOString().split("T")[0];
    
    return init;
  });

  const [images, setImages] = useState([]);
  const pasteBoxRef = useRef(null);

  const handleFieldChange = (idx, value) => {
    setFields((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleImageUpload = (files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages([event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePasteImage = (e) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages([event.target.result]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setImages([]);
  };

  const fillSample = () => {
    setFields((prev) =>
      prev.map((v, i) => v || `Sample ${fieldNames[i]}`)
    );
  };

  const clearAll = () => {
    if (window.confirm("Clear all fields and images?")) {
      const reset = Array(fieldNames.length).fill("");
      const dateIdx = fieldNames.indexOf("Date");
      if (dateIdx !== -1) reset[dateIdx] = new Date().toISOString().split("T")[0];
      
      const trDateIdx = fieldNames.indexOf("TR Date");
      if (trDateIdx !== -1) reset[trDateIdx] = new Date().toISOString().split("T")[0];
      
      setFields(reset);
      setImages([]);
    }
  };

  const exportWord = async () => {
    try {
      const templateBuffer = await fetch("/template.docx").then((res) =>
        res.arrayBuffer()
      );
      const zip = new PizZip(templateBuffer);

      const placeholder =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HwAF/gL+vYz1AAAAAElFTkSuQmCC";

      const imageModule = new ImageModule({
        getImage: (tagValue) => {
          if (!tagValue) tagValue = placeholder;
          const base64 = tagValue.split(",")[1];
          return Buffer.from(base64, "base64");
        },
        getSize: (img, tagValue) => {
          return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
              let width = (image.width / 96) * 72;
              let height = (image.height / 96) * 72;

              const maxWidth = 700;
              const maxHeight = 900;

              const widthRatio = maxWidth / width;
              const heightRatio = maxHeight / height;
              const ratio = Math.min(widthRatio, heightRatio, 1);

              width = width * ratio;
              height = height * ratio;

              resolve([width, height]);
            };
            image.src = tagValue || placeholder;
          });
        },
      });

      const doc = new Docxtemplater(zip, {
        modules: [imageModule],
        paragraphLoop: true,
        linebreaks: true,
      });

      const data = {};
      fieldNames.forEach((name, idx) => {
        const key = name.replace(/\s+/g, "_");
        if ((name === "Date" || name === "TR Date") && !fields[idx]) {
          data[key] = new Date().toISOString().split("T")[0];
        } else {
          data[key] = name === "Code Images" ? images[0] || placeholder : fields[idx] || "";
        }
      });

      await doc.renderAsync(data);

      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `${title.replace(/\s+/g, "_")}.docx`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate Word file from template.");
    }
  };

  const totalItems = fields.length + images.length;
  const filledCount = fields.filter((f) => f.trim() !== "").length + images.length;
  const progress = Math.round((filledCount / totalItems) * 100);

  // Dropdown options
  const moduleOptions = ["SD", "MM", "PP", "QM", "PM", "FICO"];
  const ricefwOptions = [
    "Module Pool",
    "API/O Data/IDOC",
    "Enhancement/Velidation",
    "Report",
    "Adobe/Smart Form",
    "Workflows",
    "Configuration",
    "Basis Activity",
    "Consulting",
    "UI5/Fiori"
  ];
  const complexityOptions = ["Level 1", "Level 2", "Level 3", "Level 4"];

  return (
    <div className={`fs-container${darkMode ? " dark" : ""}`}>
      {/* Header */}
      <header className="fs-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            <FaDownload /> Back to Home
          </button>
        </div>
        <div className="header-center">
          <h1>{title}</h1>
          <p>Technical Specification Generator</p>
        </div>
        <div className="header-right">
          <div className="progress-indicator">
            <span className="progress-text">{progress}% Complete</span>
            <div className="progress-ring">
              <svg width="40" height="40">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#e9ecef"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#5e72e4"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                  transform="rotate(-90 20 20)"
                  className="progress-circle"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="fs-main">
        {/* Left Panel - Form */}
        <section className="form-panel">
          <div className="panel-header">
            <h2>Specification Details</h2>
            <div className="panel-actions">
              <button className="action-btn secondary" onClick={fillSample}>
                <FaRegFileAlt /> Fill Sample
              </button>
              <button className="action-btn danger" onClick={clearAll}>
                <FaTrash /> Clear All
              </button>
            </div>
          </div>

          <div className="form-content">
            <div className="title-section">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter specification title..."
                className="title-input"
              />
            </div>

            <div className="fields-grid">
              {fields.map((f, idx) => (
                <div key={idx} className="field-group">
                  <label className="field-label">{fieldNames[idx]}</label>

                  {fieldNames[idx] === "Date" || fieldNames[idx] === "TR Date" ? (
                    <input
                      type="date"
                      value={f || new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="field-input"
                    />
                  ) : fieldNames[idx] === "Module" ? (
                    <select
                      value={f}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select Module</option>
                      {moduleOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : fieldNames[idx] === "RICEFW typed" ? (
                    <select
                      value={f}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select RICEFW Type</option>
                      {ricefwOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : fieldNames[idx] === "Complexity of Object" ? (
                    <select
                      value={f}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select Complexity</option>
                      {complexityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : fieldNames[idx] === "Description" || fieldNames[idx] === "Change description" ? (
                    <textarea
                      value={f}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      placeholder={`Enter ${fieldNames[idx].toLowerCase()}...`}
                      className="field-textarea"
                      rows="4"
                    />
                  ) : fieldNames[idx] === "Code Images" ? (
                    <div className="image-upload-section">
                      <div
                        className="image-drop-zone"
                        ref={pasteBoxRef}
                        onPaste={handlePasteImage}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleImageUpload(e.dataTransfer.files);
                        }}
                      >
                        <div className="drop-zone-content">
                          <FaPlus className="drop-icon" />
                          <p>Drag & drop images here or paste (Ctrl+V)</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files)}
                            className="file-input"
                          />
                        </div>
                      </div>

                      <div className="image-gallery">
                        {images.map((img, i) => (
                          <div key={i} className="image-card">
                            <img src={img} alt={`code-${i}`} />
                            <button
                              className="remove-image"
                              onClick={() => removeImage()}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={f}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      placeholder={fieldNames[idx]}
                      className="field-input"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Export Button */}
            <div className="export-section">
              <button className="export-btn" onClick={exportWord}>
                <FaFileExport /> Export to Word Document
              </button>
            </div>
          </div>
        </section>

        {/* Right Panel - Preview */}
        <section className="preview-panel">
          <div className="panel-header">
            <h2>Live Preview</h2>
            <span className="item-count">{totalItems} items</span>
          </div>

          <div className="preview-content">
            <div className="preview-header">
              <h3>{title}</h3>
              <div className="preview-meta">
                <span>Generated on: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="preview-details">
              {fields.map((f, i) => (
                f && (
                  <div key={i} className="preview-item">
                    <strong>{fieldNames[i]}:</strong>
                    <span>{f}</span>
                  </div>
                )
              ))}
            </div>

            <div className="preview-images">
              {images.length > 0 && (
                <div className="preview-image-group">
                  <h4>Code Images</h4>
                  <div className="preview-image-grid">
                    {images.map((img, idx) => (
                      <img key={idx} src={img} alt={`code-${idx}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fs-footer">
        <p>© 2025 DocAI | Designed By Divyanshu Singh Chouhan</p>
      </footer>
    </div>
  );
}