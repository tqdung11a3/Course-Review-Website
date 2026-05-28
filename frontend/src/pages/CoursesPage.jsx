import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../api/courses";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export default function CoursesPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getCourses({ page: 1, limit: 20 });
        setItems(response?.data?.items || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Cannot load courses");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (isLoading) return <LoadingSpinner label="Loading courses..." />;

  return (
    <section>
      <h2>Courses</h2>
      {error && <p className="error">{error}</p>}
      {items.length === 0 ? (
        <p className="muted">No courses yet.</p>
      ) : (
        items.map((course) => (
          <article className="card" key={course._id}>
            <h3>{course.courseName}</h3>
            <p className="muted">
              {course.courseCode} • {course.faculty || "N/A"} • {course.credits ?? 0} credits
            </p>
            <Link to={`/courses/${course._id}`}>View details</Link>
          </article>
        ))
      )}
    </section>
  );
}
