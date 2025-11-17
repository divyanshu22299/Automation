import React, { useState } from "react";
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
import "./Fs.css";
import ImageModule from "docxtemplater-image-module-free";

export default function Fs() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Functional Requirement");

  const fieldNames = [
    "Issue Title",
    "Client name",
    "Functional Name",
    "ABAPer name",
    "Module",
    "Priority",
    "Complexity",
    "Date",
    "Program Name",
    "Detailed Requirement",
  ];

  const [fields, setFields] = useState(() => {
    const init = Array(fieldNames.length).fill("");
    const dateIdx = fieldNames.indexOf("Date");
    if (dateIdx !== -1) init[dateIdx] = new Date().toISOString().split("T")[0];
    return init;
  });

  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);

  const handleFieldChange = (idx, value) => {
    setFields((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleImageUpload = (files, type) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === "before") setBeforeImages((prev) => [...prev, event.target.result]);
        if (type === "after") setAfterImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePasteImage = (e, type) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === "before") setBeforeImages((prev) => [...prev, event.target.result]);
          if (type === "after") setAfterImages((prev) => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (idx, type) => {
    if (type === "before") setBeforeImages((prev) => prev.filter((_, i) => i !== idx));
    if (type === "after") setAfterImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const fillSample = () => {
    setFields((prev) => prev.map((v, i) => v || `Sample ${fieldNames[i]}`));
  };

  const clearAll = () => {
    if (window.confirm("Clear all fields and images?")) {
      setFields(Array(fieldNames.length).fill(""));
      setBeforeImages([]);
      setAfterImages([]);
    }
  };

  window.Buffer = require("buffer/").Buffer;

  const exportWord = async () => {
    try {
      const response = await fetch("/templatefs.docx");
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      const placeholder =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HwAF/gL+vYz1AAAAAElFTkSuQmCC";

      const imageModule = new ImageModule({
        getImage: (tagValue) => {
          if (!tagValue) tagValue = placeholder;
          const base64 = tagValue.split(",")[1];
          return Buffer.from(base64, "base64");
        },
        getSize: (img, tagValue) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
              let width = (image.width / 96) * 72;
              let height = (image.height / 96) * 72;
              const ratio = Math.min(700 / width, 900 / height, 1);
              resolve([width * ratio, height * ratio]);
            };
            image.src = tagValue || placeholder;
          }),
      });

      const doc = new Docxtemplater(zip, {
        modules: [imageModule],
        paragraphLoop: true,
        linebreaks: true,
      });

      const data = {};
      fieldNames.forEach((name, idx) => (data[name] = fields[idx] || ""));

      data["Screenshot 1"] = beforeImages[0] || placeholder;
      data["Screenshot 2"] = afterImages[0] || placeholder;

      await doc.renderAsync(data);

      const out = doc.getZip().generate({ type: "blob" });
      saveAs(out, `${title.replace(/\s+/g, "_")}.docx`);
    } catch (error) {
      console.error("Error generating Word file:", error);
      alert("Failed to generate Word file. Check console for details.");
    }
  };

  const totalItems = fields.length + beforeImages.length + afterImages.length;
  const filledCount = fields.filter((f) => f.trim() !== "").length + beforeImages.length + afterImages.length;
  const progress = Math.round((filledCount / totalItems) * 100);

  // Dropdown options
  const moduleOptions = ["SD", "MM", "PP", "QM", "PM", "FICO"];
  const priorityOptions = ["Very High", "High", "Medium", "Low", "Audit Project"];
  const complexityOptions = ["Level 1", "Level 2", "Level 3", "Level 4"];

  return (
    <div className="fs-container">
      {/* Header */}
      <header className="fs-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            <FaDownload /> Back to Home
          </button>
        </div>
        <div className="header-center">
          <h1>{title}</h1>
          <p>Functional Specification Generator</p>
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

                  {fieldNames[idx] === "Date" ? (
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
                  ) : fieldNames[idx] === "Priority" ? (
                    <select
                      value={f}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select Priority</option>
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : fieldNames[idx] === "Complexity" ? (
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
                  ) : fieldNames[idx] === "Detailed Requirement" ? (
                    <textarea
                      value={f}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      placeholder="Enter detailed requirements..."
                      className="field-textarea"
                      rows="4"
                    />
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

            {/* Image Upload Sections */}
            <div className="image-sections">
              {["before", "after"].map((type) => (
                <div key={type} className="image-section">
                  <div className="image-header">
                    <h3>
                      {type === "before" ? "Before Implementation" : "After Implementation"}
                    </h3>
                    <span className="image-count">
                      {type === "before" ? beforeImages.length : afterImages.length} images
                    </span>
                  </div>
                  
                  <div
                    className="image-drop-zone"
                    onPaste={(e) => handlePasteImage(e, type)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImageUpload(e.dataTransfer.files, type);
                    }}
                  >
                    <div className="drop-zone-content">
                      <FaPlus className="drop-icon" />
                      <p>Drag & drop images here or paste (Ctrl+V)</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files, type)}
                        className="file-input"
                      />
                    </div>
                  </div>

                  <div className="image-gallery">
                    {(type === "before" ? beforeImages : afterImages).map((img, i) => (
                      <div key={i} className="image-card">
                        <img src={img} alt={`${type}-${i}`} />
                        <button
                          className="remove-image"
                          onClick={() => removeImage(i, type)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
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
              {beforeImages.length > 0 && (
                <div className="preview-image-group">
                  <h4>Before Implementation</h4>
                  <div className="preview-image-grid">
                    {beforeImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`before-${idx}`} />
                    ))}
                  </div>
                </div>
              )}

              {afterImages.length > 0 && (
                <div className="preview-image-group">
                  <h4>After Implementation</h4>
                  <div className="preview-image-grid">
                    {afterImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`after-${idx}`} />
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