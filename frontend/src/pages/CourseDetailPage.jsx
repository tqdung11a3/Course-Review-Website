import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById } from "../api/courses";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getCourseById(id);
        setCourse(response?.data?.course || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Cannot load course details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  if (isLoading) return <LoadingSpinner label="Loading course..." />;
  if (error) return <p className="error">{error}</p>;
  if (!course) return <p className="muted">Course not found.</p>;

  return (
    <section className="card">
      <h2>{course.courseName}</h2>
      <p className="muted">{course.courseCode}</p>
      <p>{course.description || "No description."}</p>
    </section>
  );
}
