export function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="card">
      <span className="muted">{label}</span>
    </div>
  );
}
