import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthInput } from "../components/auth/AuthInput";
import { IconLock, IconMail } from "../components/auth/AuthIcons";
import { RoleToggle } from "../components/auth/RoleToggle";
import { useAuth } from "../hooks/useAuth";
import { AUTH_ROLES } from "../utils/authConstants";
import { translateAuthError } from "../utils/authErrorMessages";
import { validateLoginForm } from "../utils/validateAuthForm";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: AUTH_ROLES.student,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateLoginForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await login({
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      const nextPath = location.state?.from?.pathname || "/courses";
      navigate(nextPath, { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      // Tài khoản chưa verify → chuyển sang trang xác thực
      if (data?.data?.requiresVerification) {
        sessionStorage.setItem("pendingVerifyEmail", data.data.email || form.email.trim());
        navigate("/verify", { replace: true });
        return;
      }
      setError(translateAuthError(data?.message) || "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Đăng nhập"
      footer={
        <p className="auth-footer">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="auth-link">
            Đăng ký ngay
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="login-email"
          label="Email trường"
          type="email"
          placeholder="student@sis.hust.edu.vn"
          autoComplete="email"
          icon={<IconMail />}
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={fieldErrors.email}
        />

        <AuthInput
          id="login-password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          icon={<IconLock />}
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          error={fieldErrors.password}
        />

        <RoleToggle
          value={form.role}
          onChange={(role) => updateField("role", role)}
          variant="login"
        />

        {error && <p className="auth-form-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthCard>
  );
}
