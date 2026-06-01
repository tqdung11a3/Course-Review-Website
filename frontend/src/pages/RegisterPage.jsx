import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthInput } from "../components/auth/AuthInput";
import { IconIdCard, IconLock, IconMail, IconUser } from "../components/auth/AuthIcons";
import { RoleToggle } from "../components/auth/RoleToggle";
import { useAuth } from "../hooks/useAuth";
import { AUTH_ROLES, SCHOOL_EMAIL_SUFFIX } from "../utils/authConstants";
import { translateAuthError } from "../utils/authErrorMessages";
import { validateRegisterForm } from "../utils/validateAuthForm";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: AUTH_ROLES.student,
    studentId: "",
    password: "",
    confirmPassword: "",
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
    const errors = validateRegisterForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        studentId: form.role === AUTH_ROLES.student ? form.studentId.trim() : "",
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/courses", { replace: true });
    } catch (err) {
      setError(translateAuthError(err?.response?.data?.message) || "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Đăng ký"
      footer={
        <p className="auth-footer">
          Đã có tài khoản?{" "}
          <Link to="/login" className="auth-link">
            Đăng nhập
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="register-fullName"
          label="Họ và tên"
          required
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          icon={<IconUser />}
          value={form.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          error={fieldErrors.fullName}
        />

        <AuthInput
          id="register-email"
          label="Email trường"
          required
          type="email"
          placeholder="student@sis.hust.edu.vn"
          autoComplete="email"
          icon={<IconMail />}
          hint={`Chỉ chấp nhận email trường ${SCHOOL_EMAIL_SUFFIX}`}
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={fieldErrors.email}
        />

        <RoleToggle
          value={form.role}
          onChange={(role) => updateField("role", role)}
        />

        {form.role === AUTH_ROLES.student && (
          <AuthInput
            id="register-studentId"
            label="Mã sinh viên"
            required
            placeholder="20210001"
            icon={<IconIdCard />}
            value={form.studentId}
            onChange={(e) => updateField("studentId", e.target.value)}
            error={fieldErrors.studentId}
          />
        )}

        <AuthInput
          id="register-password"
          label="Mật khẩu"
          required
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          icon={<IconLock />}
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          error={fieldErrors.password}
        />

        <AuthInput
          id="register-confirmPassword"
          label="Xác nhận mật khẩu"
          required
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          icon={<IconLock />}
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        {error && <p className="auth-form-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </AuthCard>
  );
}
