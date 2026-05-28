import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="card">
      <h2>404 - Not Found</h2>
      <p className="muted">The page you requested does not exist.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}
