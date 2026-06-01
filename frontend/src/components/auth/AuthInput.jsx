export function AuthInput({
  id,
  label,
  required = false,
  hint,
  error,
  icon,
  className = "",
  ...inputProps
}) {
  return (
    <div className={`auth-field ${className}`.trim()}>
      <label htmlFor={id} className="auth-label">
        {label}
        {required && <span className="auth-required"> *</span>}
      </label>
      <div className={`auth-input-wrap ${error ? "auth-input-wrap--error" : ""}`}>
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input id={id} className="auth-input" {...inputProps} />
      </div>
      {hint && !error && <p className="auth-hint">{hint}</p>}
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
}
