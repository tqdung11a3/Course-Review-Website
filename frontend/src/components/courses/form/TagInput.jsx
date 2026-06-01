import { useState } from "react";

export function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");

  function addTag(raw) {
    const value = raw.trim();
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
    setInput("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(input);
    }
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="tag-input">
      <div className="tag-input-wrap">
        {tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Xóa ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="tag-input-field"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
        />
      </div>
    </div>
  );
}
