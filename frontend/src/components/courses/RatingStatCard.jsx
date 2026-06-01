export function RatingStatCard({ icon, label, value, variant }) {
  return (
    <div className={`rating-stat-card rating-stat-card--${variant}`}>
      <span className="rating-stat-icon">{icon}</span>
      <span className="rating-stat-label">{label}</span>
      <span className="rating-stat-value">{value}</span>
    </div>
  );
}
