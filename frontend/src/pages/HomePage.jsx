import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="card">
      <h1>Course Review Website</h1>
      <p className="muted">Frontend scaffold is ready for team development.</p>
      <p>
        Start with <Link to="/courses">Course List</Link> or login to test protected routes.
      </p>
    </section>
  );
}
