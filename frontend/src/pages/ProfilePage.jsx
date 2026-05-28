import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <section className="card">
      <h2>My Profile</h2>
      <p>
        <strong>Name:</strong> {user?.fullName || "N/A"}
      </p>
      <p>
        <strong>Email:</strong> {user?.email || "N/A"}
      </p>
      <p>
        <strong>Role:</strong> {user?.role || "student"}
      </p>
    </section>
  );
}
