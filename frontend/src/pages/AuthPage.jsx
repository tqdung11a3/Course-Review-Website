import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/AuthPage.css";

// SVG Icons
const SVG = {
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  ),
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  id: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h6" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  gcheck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  tick: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  bigTick: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [screen, setScreen] = useState("login"); // login | register | success

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "student",
    showPw: false,
    error: "",
    loading: false,
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    role: "student",
    studentId: "",
    password: "",
    confirm: "",
    showPw: false,
    showCf: false,
    errors: {},
    loading: false,
  });

  const handleLoginChange = (field, value) => {
    setLoginForm((prev) => ({ ...prev, [field]: value, error: "" }));
  };

  const handleRegisterChange = (field, value) => {
    setRegisterForm((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: "" },
    }));
  };

  const handleLoginSubmit = async () => {
    const { email, password, role } = loginForm;
    if (!email || !password) {
      setLoginForm((prev) => ({
        ...prev,
        error: "Vui lòng nhập email và mật khẩu.",
      }));
      return;
    }

    setLoginForm((prev) => ({ ...prev, loading: true }));
    try {
      await login({ email, password, role });
      navigate("/");
    } catch (err) {
      setLoginForm((prev) => ({
        ...prev,
        error: err?.response?.data?.message || "Đăng nhập thất bại.",
      }));
    } finally {
      setLoginForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleRegisterSubmit = async () => {
    const R = registerForm;
    const errs = {};

    if (!R.fullName.trim()) errs.fullName = "Vui lòng nhập họ tên.";
    if (!R.email.trim()) errs.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(R.email))
      errs.email = "Email không hợp lệ.";
    if (R.role === "student" && !R.studentId.trim())
      errs.studentId = "Vui lòng nhập mã sinh viên.";
    if (!R.password) errs.password = "Vui lòng nhập mật khẩu.";
    else if (R.password.length < 6)
      errs.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (!R.confirm) errs.confirm = "Vui lòng xác nhận mật khẩu.";
    else if (R.password !== R.confirm) errs.confirm = "Mật khẩu không khớp.";

    if (Object.keys(errs).length) {
      setRegisterForm((prev) => ({ ...prev, errors: errs }));
      return;
    }

    setRegisterForm((prev) => ({ ...prev, loading: true }));
    try {
      await apiRegister({
        fullName: R.fullName,
        email: R.email,
        rolerrole,
        studentId: R.role === "student" ? R.studentId : undefined,
        password: R.password,
      });
      setScreen("success");
    } catch (err) {
      setRegisterForm((prev) => ({
        ...prev,
        errors: {
          form: err?.response?.data?.message || "Đăng ký thất bại.",
        },
      }));
    } finally {
      setRegisterForm((prev) => ({ ...prev, loading: false }));
    }
  };

  const renderField = ({ id, label, required, icon, type, placeholder, value, errKey, eyeKey, hint }) => {
    const isLogin = screen === "login";
    const errs = isLogin ? {} : registerForm.errors;
    const err = errKey ? errs[errKey] || "" : "";
    const show = eyeKey ? (isLogin ? loginForm[eyeKey] : registerForm[eyeKey]) : false;
    const inputType = type === "password" ? (show ? "text" : "password") : type;

    return (
      <div key={id} className="field">
        <label htmlFor={id} className="label">
          {label}
          {required && <span>*</span>}
        </label>
        <div className="input-wrap">
          <span className="icon">{icon}</span>
          <input
            id={id}
            className={`inp${err ? " err" : ""}`}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              if (isLogin) {
                handleLoginChange(id.replace("l-", ""), e.target.value);
              } else {
                handleRegisterChange(id.replace("r-", ""), e.target.value);
              }
            }}
            autoComplete="off"
          />
          {eyeKey && (
            <button
              className="eye"
              type="button"
              onClick={() => {
                if (isLogin) {
                  setLoginForm((prev) => ({ ...prev, [eyeKey]: !prev[eyeKey] }));
                } else {
                  setRegisterForm((prev) => ({ ...prev, [eyeKey]: !prev[eyeKey] }));
                }
              }}
              aria-label="toggle"
            >
              {show ? SVG.eyeOff : SVG.eye}
            </button>
          )}
        </div>
        {hint && !err && <p className="hint">{hint}</p>}
        {err && <p className="ferr">{err}</p>}
      </div>
    );
  };

  if (screen === "success") {
    return (
      <div className="page">
        <div className="logo-wrap">
          <div className="logo-icon">R</div>
          <h1 className="logo-name">ReviewMon</h1>
          <p className="logo-tag">Nền tảng review môn học đáng tin cậy</p>
        </div>
        <div className="card">
          <div className="success-inner">
            <div className="success-circle">{SVG.bigTick}</div>
            <h2 className="success-title">Đăng ký thành công!</h2>
            <p className="success-msg">Tài khoản của bạn đã được tạo. Đăng nhập để bắt đầu khám phá.</p>
            <button
              className="primary-btn"
              onClick={() => {
                setScreen("login");
                setLoginForm({
                  email: "",
                  password: "",
                  role: "student",
                  showPw: false,
                  error: "",
                  loading: false,
                });
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "register") {
    return (
      <div className="page">
        <div className="logo-wrap">
          <div className="logo-icon">R</div>
          <h1 className="logo-name">ReviewMon</h1>
          <p className="logo-tag">Tạo tài khoản để bắt đầu chia sẻ và đọc review</p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: "21px", fontWeight: 700, marginBottom: "22px" }}>Đăng ký</h2>
          {renderField({
            id: "r-fullName",
            label: "Họ và tên",
            required: true,
            icon: SVG.user,
            type: "text",
            placeholder: "Nguyễn Văn A",
            value: registerForm.fullName,
            errKey: "fullName",
          })}
          {renderField({
            id: "r-email",
            label: "Email trường",
            required: true,
            icon: SVG.mail,
            type: "email",
            placeholder: "student@university.edu.vn",
            value: registerForm.email,
            errKey: "email",
            hint: "Chỉ chấp nhận email trường @university.edu.vn",
          })}
          <div className="field">
            <label className="label">Vai trò <span>*</span></label>
            <div className="role-row">
              <button
                type="button"
                className={`role-btn${registerForm.role === "student" ? " active" : ""}`}
                onClick={() => handleRegisterChange("role", "student")}
              >
                {SVG.user} Sinh viên
              </button>
              <button
                type="button"
                className={`role-btn${registerForm.role === "admin" ? " active" : ""}`}
                onClick={() => handleRegisterChange("role", "admin")}
              >
                {SVG.shield} Quản trị
              </button>
            </div>
          </div>
          {registerForm.role === "student" &&
            renderField({
              id: "r-studentId",
              label: "Mã sinh viên",
              required: true,
              icon: SVG.id,
              type: "text",
              placeholder: "20210001",
              value: registerForm.studentId,
              errKey: "studentId",
            })}
          {renderField({
            id: "r-password",
            label: "Mật khẩu",
            required: true,
            icon: SVG.lock,
            type: "password",
            placeholder: "••••••••",
            value: registerForm.password,
            errKey: "password",
            eyeKey: "showPw",
          })}
          {renderField({
            id: "r-confirm",
            label: "Xác nhận mật khẩu",
            required: true,
            icon: SVG.lock,
            type: "password",
            placeholder: "••••••••",
            value: registerForm.confirm,
            errKey: "confirm",
            eyeKey: "showCf",
          })}
          {registerForm.errors.form && <p className="gerr">{registerForm.errors.form}</p>}
          <button
            className="primary-btn"
            onClick={handleRegisterSubmit}
            disabled={registerForm.loading}
          >
            {registerForm.loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
          <hr className="sep" />
          <p className="nav-line">
            Đã có tài khoản?{" "}
            <button className="nav-link" onClick={() => setScreen("login")}>
              Đăng nhập ngay
            </button>
          </p>
        </div>
        <div className="why-card">
          <div className="why-title">{SVG.gcheck} Lợi ích khi đăng ký</div>
          <ul className="why-list">
            {[
              "Viết và chia sẻ review về các môn học đã học",
              "Đọc review chi tiết từ sinh viên đã học",
              "Lưu và theo dõi các môn học quan tâm",
              "Tương tác và đánh giá review hữu ích",
            ].map((item, idx) => (
              <li key={idx} className="why-item">
                {SVG.tick} {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Login screen
  return (
    <div className="page">
      <div className="logo-wrap">
        <div className="logo-icon">R</div>
        <h1 className="logo-name">ReviewMon</h1>
        <p className="logo-tag">Nền tảng review môn học đáng tin cậy</p>
      </div>
      <div className="card">
        <h2 style={{ fontSize: "21px", fontWeight: 700, marginBottom: "22px" }}>Đăng nhập</h2>
        {renderField({
          id: "l-email",
          label: "Email trường",
          icon: SVG.mail,
          type: "email",
          placeholder: "student@university.edu.vn",
          value: loginForm.email,
        })}
        {renderField({
          id: "l-password",
          label: "Mật khẩu",
          icon: SVG.lock,
          type: "password",
          placeholder: "••••••••",
          value: loginForm.password,
          eyeKey: "showPw",
        })}
        <div className="field">
          <label className="label">Vai trò</label>
          <div className="role-row">
            <button
              type="button"
              className={`role-btn${loginForm.role === "student" ? " active" : ""}`}
              onClick={() => handleLoginChange("role", "student")}
            >
              {SVG.mail} Sinh viên
            </button>
            <button
              type="button"
              className={`role-btn${loginForm.role === "admin" ? " active" : ""}`}
              onClick={() => handleLoginChange("role", "admin")}
            >
              {SVG.shield} Quản trị
            </button>
          </div>
        </div>
        {loginForm.error && <p className="gerr">{loginForm.error}</p>}
        <button
          className="primary-btn"
          onClick={handleLoginSubmit}
          disabled={loginForm.loading}
        >
          {loginForm.loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <hr className="sep" />
        <p className="nav-line">
          Chưa có tài khoản?{" "}
          <button className="nav-link" onClick={() => setScreen("register")}>
            Đăng ký ngay
          </button>
        </p>
      </div>
      <div className="why-card">
        <div className="why-title">{SVG.gcheck} Tại sao chọn ReviewMon?</div>
        <ul className="why-list">
          {[
            "Chỉ sinh viên đã học mới được review",
            "Có hệ thống xác minh và kiểm chứng",
            "Review theo mẫu chuẩn, dễ so sánh",
            "Cộng đồng đánh giá review chất lượng",
          ].map((item, idx) => (
            <li key={idx} className="why-item">
              {SVG.tick} {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
