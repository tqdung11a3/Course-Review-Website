export function AuthCard({ title, children, footer }) {
  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">{title}</h1>
        {children}
        {footer}
      </section>
    </div>
  );
}
