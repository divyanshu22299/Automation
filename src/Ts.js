import React, { useState, useEffect, useRef } from "react";
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
import ImageModule from "docxtemplater-image-module-free";
import "./Fs.css";
window.Buffer = require("buffer/").Buffer;

export default function Fs({ darkMode, setDarkMode }) {  // receive from App.js
  const navigate = useNavigate();
  const [title, setTitle] = useState("Functional Requirement");


  const fieldNames = [
    "Client name",
    "Module",
    "FS document number",
    "TS document number",
    "Date",
    "Type of development",
    "TR Number",
    "Description",
    "TR Date",
    "Complexity of Object",
    "Program Name",
    "Package",
    "Code Images",
    "Change description",
  ];

 const [fields, setFields] = useState(() => {
  try {
    const raw = localStorage.getItem("Ts_fields_v3");
    if (raw) {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed.fields)
        ? [...parsed.fields.slice(0, fieldNames.length), ...Array(fieldNames.length - parsed.fields.length).fill("")]
        : Array(fieldNames.length).fill("");

      const dateIdx = fieldNames.indexOf("Date");
      if (dateIdx !== -1 && !arr[dateIdx]) arr[dateIdx] = new Date().toISOString().split("T")[0];

      const trDateIdx = fieldNames.indexOf("TR Date");
      if (trDateIdx !== -1 && !arr[trDateIdx]) arr[trDateIdx] = new Date().toISOString().split("T")[0];

      return arr;
    }
  } catch {}
  const init = Array(fieldNames.length).fill("");
  const dateIdx = fieldNames.indexOf("Date");
  if (dateIdx !== -1) init[dateIdx] = new Date().toISOString().split("T")[0];

  const trDateIdx = fieldNames.indexOf("TR Date");
  if (trDateIdx !== -1) init[trDateIdx] = new Date().toISOString().split("T")[0];

  return init;
});

  const [images, setImages] = useState(() => {
    try {
      const raw = localStorage.getItem("Ts_images_v3");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const pasteBoxRef = useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      localStorage.setItem("Ts_fields_v3", JSON.stringify({ title, fields }));
      localStorage.setItem("Ts_images_v3", JSON.stringify(images));
      setSaving(false);
    }, 6000);
    return () => clearTimeout(id);
  }, [fields, title, images]);

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

  const exportJSON = () => {
    const payload = {
      title,
      date: new Date().toISOString(),
      details: fields,
      images,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    saveAs(
      blob,
      `${(title || "functional_spec").replace(/\s+/g, "_")}.json`
    );
  };

  const exportMarkdown = () => {
    let md = `# ${title}\n\n`;
    fields.forEach((f, i) => {
      if (i === 12) {
        md += `## ${fieldNames[i]}\n\n`;
        images.length
          ? images.forEach(
              (img, idx) => (md += `![Image ${idx + 1}](${img})\n\n`)
            )
          : (md += "_(no images)_\n\n");
      } else {
        md += `## ${fieldNames[i]}\n\n${f || "_(empty)_"}\n\n`;
      }
    });
    const blob = new Blob([md], { type: "text/markdown" });
    saveAs(blob, `${(title || "functional_spec").replace(/\s+/g, "_")}.md`);
  };

  const copyMarkdown = async () => {
    let md = `# ${title}\n\n`;
    fields.forEach((f, i) => {
      if (i === 12) {
        md += `## ${fieldNames[i]}\n\n`;
        images.length
          ? images.forEach(
              (img, idx) => (md += `![Image ${idx + 1}](${img})\n\n`)
            )
          : (md += "_(no images)_\n\n");
      } else {
        md += `## ${fieldNames[i]}\n\n${f || "_(empty)_"}\n\n`;
      }
    });
    try {
      await navigator.clipboard.writeText(md);
      alert("Markdown copied to clipboard");
    } catch (e) {
      alert("Copy failed — your browser may block clipboard access");
    }
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


  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Spec saved locally. Use Export to download.");
  };

  const exportWord = async () => {
    try {
      const templateBuffer = await fetch("/template.docx").then((res) =>
        res.arrayBuffer()
      );
      const zip = new PizZip(templateBuffer);

      const imageModule = new ImageModule({
        getImage: (tagValue) => {
          if (!tagValue) return null;
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
            image.src = tagValue;
          });
        },
      });

      const doc = new Docxtemplater(zip, {
        modules: [imageModule],
        paragraphLoop: true,
        linebreaks: true,
      });


      const placeholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HwAF/gL+vYz1AAAAAElFTkSuQmCC"; // 1x1 px transparent

 const data = {};
fieldNames.forEach((name, idx) => {
  const key = name.replace(/\s+/g, "_");
  if ((name === "Date" || name === "TR Date") && !fields[idx]) {
    data[key] = new Date().toISOString().split("T")[0]; // default today
  } else {
    data[key] = name === "Code Images" ? images[0] || placeholder : fields[idx] || "(empty)";
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

  const filledCount =
    fields.filter((f) => f.trim() !== "").length + images.length;
  const progress = Math.round(
    (filledCount / (fields.length + 1)) * 100
  );

  return (
    <div className={`fs-page${darkMode ? " dark" : ""}`}>
      <header className="fs-header">
        <div>
          <button className="btn-icon" onClick={() => navigate("/")}>
            🔙 Back
          </button>
        </div>
        <div>
          <h1>Functional Spec Builder</h1>
          <div className="subtitle">
            Create, preview & export your functional specs
          </div>
        </div>
        <div className="actions">
          <input placeholder="Search..." />
          <button
            className="btn-icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <FaSun className="icon-anim" />
            ) : (
              <FaMoon className="icon-anim" />
            )}{" "}
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
                placeholder="Technical Specification"
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

            {fieldNames.map((name, idx) => (
              <div key={idx} className="fs-field">
                <label className="field-label">{name}</label>

                {name === "Code Images" ? (
                  <div
                    className="image-upload"
                    ref={pasteBoxRef}
                    contentEditable
                    suppressContentEditableWarning
                    onPaste={handlePasteImage}
                    onKeyDown={(e) => {
                      if (
                        !(
                          (e.ctrlKey || e.metaKey) &&
                          e.key.toLowerCase() === "v"
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      border: "1px dashed #aaa",
                      padding: "8px",
                      minHeight: "80px",
                      cursor: "text",
                      position: "relative",
                    }}
                  >
                    {images.length === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          color: "#888",
                          fontStyle: "italic",
                          pointerEvents: "none",
                        }}
                      >
                        Click here and paste (Ctrl+V) or upload an image
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e.target.files)
                      }
                      style={{
                        display: "block",
                        marginTop: images.length === 0 ? "30px" : "10px",
                      }}
                    />
                    <div
                      className="image-preview-list"
                      style={{ marginTop: "10px" }}
                    >
                      {images.map((img, i) => (
                        <div key={i} className="image-item">
                          <img
                            src={img}
                            alt={`uploaded-${i}`}
                            style={{
                              maxWidth: "120px",
                              border: "1px solid #ccc",
                              margin: "5px",
                            }}
                          />
                          <button
                            type="button"
                            className="btn-icon btn-danger"
                            onClick={() => removeImage()}
                          >
                            <FaTrash /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : name === "Change description" ? (
                  <textarea
                    value={fields[idx]}
                    onChange={(e) =>
                      handleFieldChange(idx, e.target.value)
                    }
                    placeholder={name}
                    style={{
                      minHeight: "150px",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  />
                ) : name === "Date" || name === "TR Date" ? (
  <input
    type="date"
    value={fields[idx] || new Date().toISOString().split("T")[0]}
    onChange={(e) => handleFieldChange(idx, e.target.value)}
  />
)

                
                
                
                :  (
                  <input
                    value={fields[idx]}
                    onChange={(e) =>
                      handleFieldChange(idx, e.target.value)
                    }
                    placeholder={name}
                  />
                )}
              </div>
            ))}

            <div className="fs-buttons">
              <button
                type="button"
                className="btn-icon"
                onClick={fillSample}
              >
                <FaRegFileAlt className="icon-anim" /> Fill Sample
              </button>
              <button
                type="button"
                className="btn-icon btn-danger"
                onClick={clearAll}
              >
                ❌ Clear All
              </button>
              <button type="submit" className="btn-icon">
                <FaSave className="icon-anim" /> Save
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={exportJSON}
              >
                <FaFileExport className="icon-anim" /> Export JSON
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={exportMarkdown}
              >
                <FaRegFileAlt className="icon-anim" /> Export MD
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={copyMarkdown}
              >
                <FaClipboard className="icon-anim" /> Copy MD
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={exportWord}
              >
                <FaFileExport className="icon-anim" /> Export Word
              </button>
            </div>
          </form>
        </section>

        <aside className="fs-preview">
          <div className="flex justify-between mb-4">
            <h2>Live Preview</h2>
            <div>{fields.length} items</div>
          </div>

          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}% filled</div>

          <div>
            <h3>{title}</h3>
            <ol>
              {fieldNames.map((name, i) => (
                <li key={i}>
                  <strong>{name}:</strong>{" "}
                  {name === "Code Images" ? (
                    images.length ? (
                      images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`preview-${idx}`}
                          style={{
                            maxWidth: "100px",
                            margin: "5px",
                          }}
                        />
                      ))
                    ) : (
                      <em>No images</em>
                    )
                  ) : fields[i] || <em>No description</em>}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </main>

      <footer className="Ts-footer">© 2025 Automation Tool</footer>
    </div>
  );
}
