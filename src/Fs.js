import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaMoon,
  FaSun,
  FaSave,
  FaFileExport,
  FaClipboard,
  FaRegFileAlt,
  FaTrash,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import "./Fs.css";
import ImageModule from "docxtemplater-image-module-free";
export default function Fs({ darkMode, setDarkMode }) {  // receive from App.js
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
  try {
    const raw = localStorage.getItem("fs_fields_v3");
    if (raw) {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed.fields)
        ? [...parsed.fields.slice(0, fieldNames.length), ...Array(fieldNames.length - parsed.fields.length).fill("")]
        : Array(fieldNames.length).fill("");
      // ✅ Set Date field to today if empty
      const dateIdx = fieldNames.indexOf("Date");
      if (dateIdx !== -1 && !arr[dateIdx]) arr[dateIdx] = new Date().toISOString().split("T")[0];
      return arr;
    }
  } catch {}
  const init = Array(fieldNames.length).fill("");
  const dateIdx = fieldNames.indexOf("Date");
  if (dateIdx !== -1) init[dateIdx] = new Date().toISOString().split("T")[0]; // ✅ default today
  return init;
});


  const [beforeImages, setBeforeImages] = useState(() => {
    try {
      const raw = localStorage.getItem("fs_before_images");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [afterImages, setAfterImages] = useState(() => {
    try {
      const raw = localStorage.getItem("fs_after_images");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      localStorage.setItem("fs_fields_v3", JSON.stringify({ title, fields }));
      localStorage.setItem("fs_before_images", JSON.stringify(beforeImages));
      localStorage.setItem("fs_after_images", JSON.stringify(afterImages));
      setSaving(false);
    }, 600);
    return () => clearTimeout(id);
  }, [fields, title, beforeImages, afterImages]);

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

  const exportJSON = () => {
    const payload = { title, date: new Date().toISOString(), details: fields, beforeImages, afterImages };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    saveAs(blob, `${(title || "functional_spec").replace(/\s+/g, "_")}.json`);
  };

  const exportMarkdown = () => {
    let md = `# ${title}\n\n`;
    fields.forEach((f, i) => {
      md += `## ${fieldNames[i]}\n\n${f || "_(empty)_"}\n\n`;
    });
    md += "## Before screenshot\n\n";
    beforeImages.length ? beforeImages.forEach((img, idx) => (md += `![Before ${idx + 1}](${img})\n\n`)) : (md += "_(no images)_\n\n");
    md += "## After screenshot\n\n";
    afterImages.length ? afterImages.forEach((img, idx) => (md += `![After ${idx + 1}](${img})\n\n`)) : (md += "_(no images)_\n\n");

    const blob = new Blob([md], { type: "text/markdown" });
    saveAs(blob, `${(title || "functional_spec").replace(/\s+/g, "_")}.md`);
  };

  const copyMarkdown = async () => {
    let md = `# ${title}\n\n`;
    fields.forEach((f, i) => {
      md += `## ${fieldNames[i]}\n\n${f || "_(empty)_"}\n\n`;
    });
    md += "## Before screenshot\n\n";
    beforeImages.length ? beforeImages.forEach((img, idx) => (md += `![Before ${idx + 1}](${img})\n\n`)) : (md += "_(no images)_\n\n");
    md += "## After screenshot\n\n";
    afterImages.length ? afterImages.forEach((img, idx) => (md += `![After ${idx + 1}](${img})\n\n`)) : (md += "_(no images)_\n\n");

    try {
      await navigator.clipboard.writeText(md);
      alert("Markdown copied to clipboard");
    } catch (e) {
      alert("Copy failed — your browser may block clipboard access");
    }
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


  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Spec saved locally. Use Export to download.");
  };

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

// ✅ same style as working FS page
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

  return (
    <div className={`fs-page${darkMode ? " dark" : ""}`}>
      <header className="fs-header">
        <div>
          <button className="btn-icon" onClick={() => navigate("/")}>🔙 Back</button>
        </div>
        <div>
          <h1>{title}</h1>
          <div className="subtitle">Create, preview & export your Funsctional Requirment specs</div>
        </div>
        <div className="actions">
          <input placeholder="Search..." />
          <button className="btn-icon" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun className="icon-anim" /> : <FaMoon className="icon-anim" />}{" "}
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <main className="fs-main">
        <section className="fs-section">
          <div className="flex justify-between mb-4">
            <h2>Spec Details</h2>
            <div>{saving ? "Saving..." : "Saved"}</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="fs-field">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Unit Testing"
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  padding: "12px 16px",
                  width: "100%",
                  border: "none",
                  borderBottom: "2px solid #6366f1",
                  outline: "none",
                  marginBottom: "20px",
                  backgroundColor: "transparent",
                }}
              />
            </div>

            {fields.map((f, idx) => (
  <div key={idx} className="fs-field">
    <label className="field-label">{fieldNames[idx]}</label>

    {fieldNames[idx] === "Date" ? (
      <input
        type="date"
        value={f || new Date().toISOString().split("T")[0]}   // default today
        onChange={(e) => handleFieldChange(idx, e.target.value)}
      />
    ) : fieldNames[idx] === "Complexity" ? (
      <select
        value={f}
        onChange={(e) => handleFieldChange(idx, e.target.value)}
      >
        <option value="">Select</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    ) : (
      <input
        value={f}
        onChange={(e) => handleFieldChange(idx, e.target.value)}
        placeholder={fieldNames[idx]}
      />
    )}
  </div>
))}



            {["before", "after"].map((type) => (
              <div key={type} className="fs-field">
                <label>{type === "before" ? "Before screenshot" : "After screenshot"}</label>
                <div
                  className="image-upload"
                  contentEditable
                  suppressContentEditableWarning
                  onPaste={(e) => handlePasteImage(e, type)}
                  onKeyDown={(e) => {
                    if (!((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v")) e.preventDefault();
                  }}
                  style={{
                    border: "1px dashed #aaa",
                    padding: "8px",
                    minHeight: "80px",
                    cursor: "text",
                    position: "relative",
                  }}
                >
                  <div style={{ position: "absolute", top: "8px", left: "8px", color: "#888", fontStyle: "italic", pointerEvents: "none" }}>
                    Click here and paste (Ctrl+V) or upload an image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files, type)}
                    style={{ display: "block", marginTop: "30px" }}
                  />
                  <div className="image-preview-list">
                    {(type === "before" ? beforeImages : afterImages).map((img, i) => (
                      <div key={i} className="image-item">
                        <img src={img} alt={`${type}-${i}`} style={{ maxWidth: "120px", margin: "5px" }} />
                        <button type="button" onClick={() => removeImage(i, type)}>
                          <FaTrash /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="fs-buttons">
              <button type="button" className="btn-icon" onClick={fillSample}><FaRegFileAlt className="icon-anim" /> Fill Sample</button>
              <button type="button" className="btn-icon btn-danger" onClick={clearAll}>❌ Clear All</button>
              <button type="submit" className="btn-icon"><FaSave className="icon-anim" /> Save</button>
              <button type="button" className="btn-icon" onClick={exportJSON}><FaFileExport className="icon-anim" /> Export JSON</button>
              <button type="button" className="btn-icon" onClick={exportMarkdown}><FaRegFileAlt className="icon-anim" /> Export MD</button>
              <button type="button" className="btn-icon" onClick={copyMarkdown}><FaClipboard className="icon-anim" /> Copy MD</button>
              <button type="button" className="btn-icon" onClick={exportWord}><FaFileExport className="icon-anim" /> Export Word</button>
            </div>
          </form>
        </section>

        <aside className="fs-preview">
          <div className="flex justify-between mb-4">
            <h2>Live Preview</h2>
            <div>{fields.length + beforeImages.length + afterImages.length} items</div>
          </div>

          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">{progress}% filled</div>

          <div>
            <h3>{title}</h3>
            <ol>
              {fields.map((f, i) => <li key={i}>{f || <em>No description</em>}</li>)}
              <li>
                <strong>Screenshot 1:</strong>{" "}
                {beforeImages.length ? beforeImages.map((img, idx) => <img key={idx} src={img} alt={`before-${idx}`} style={{ maxWidth: "100px" }} />) : <em>No images</em>}
              </li>
              <li>
                <strong>Screenshot 2:</strong>{" "}
                {afterImages.length ? afterImages.map((img, idx) => <img key={idx} src={img} alt={`after-${idx}`} style={{ maxWidth: "100px" }} />) : <em>No images</em>}
              </li>
            </ol>
          </div>
        </aside>
      </main>

      <footer className="fs-footer">© 2025 Automation Tool</footer>
    </div>
  );
}
