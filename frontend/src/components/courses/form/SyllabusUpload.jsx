import { useRef, useState } from "react";

const ACCEPT = ".pdf,.doc,.docx";
const MAX_SIZE = 10 * 1024 * 1024;

export function SyllabusUpload({ files, onChange, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");

  function validateAndAdd(fileList) {
    const next = [...files];
    const messages = [];

    for (const file of fileList) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (![".pdf", ".doc", ".docx"].includes(ext)) {
        messages.push(`${file.name}: chỉ chấp nhận PDF, DOC, DOCX`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        messages.push(`${file.name}: tối đa 10MB`);
        continue;
      }
      next.push(file);
    }

    if (messages.length) setLocalError(messages.join(". "));
    else setLocalError("");

    onChange(next);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    validateAndAdd(event.dataTransfer.files);
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="syllabus-upload">
      <div
        className={`syllabus-dropzone ${dragOver ? "syllabus-dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 18h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="syllabus-dropzone-title">Tải lên tài liệu syllabus</p>
        <p className="syllabus-dropzone-hint">PDF, DOC, DOCX (tối đa 10MB)</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            validateAndAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="syllabus-file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <span>{file.name}</span>
              <button type="button" onClick={() => removeFile(index)}>
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}

      {(error || localError) && <p className="auth-field-error">{error || localError}</p>}
    </div>
  );
}
