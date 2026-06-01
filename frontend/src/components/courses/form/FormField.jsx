export function FormField({ label, required, error, hint, children, className = "" }) {
  return (
    <div className={`form-field ${className}`.trim()}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="auth-required"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
}
