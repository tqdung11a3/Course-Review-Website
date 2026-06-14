import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/auth/AuthCard";
import { useAuth } from "../hooks/useAuth";

export default function VerifyPage() {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Lấy email từ sessionStorage (được set bởi RegisterPage)
  const email = sessionStorage.getItem("pendingVerifyEmail") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 phút
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef([]);

  // Nếu không có email thì redirect về register
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
      setResendCooldown((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    setShake(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      submitOtp(newOtp);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const newOtp = [...otp];
    for (let i = 0; i < paste.length && i < 6; i++) newOtp[i] = paste[i];
    setOtp(newOtp);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
    if (newOtp.every((d) => d !== "")) submitOtp(newOtp);
  }

  async function submitOtp(otpArr) {
    const otpCode = (otpArr || otp).join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({ email, otpCode });
      sessionStorage.removeItem("pendingVerifyEmail");
      navigate("/courses", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Xác thực thất bại.";
      setError(msg);
      setOtp(["", "", "", "", "", ""]);
      setShake(true);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
        setShake(false);
      }, 600);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    try {
      await resendOtp({ email });
      setCountdown(300);
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err?.response?.data?.message || "Gửi lại mã thất bại.");
    } finally {
      setResendLoading(false);
    }
  }

  if (!email) return null;

  return (
    <AuthCard
      title="Xác thực email"
      footer={
        <p className="auth-footer">
          <Link to="/register" className="auth-link">
            ← Quay lại đăng ký
          </Link>
        </p>
      }
    >
      <div className="verify-body">
        <p className="verify-desc">
          Chúng tôi đã gửi mã 6 chữ số đến <br />
          <strong>{email}</strong>
        </p>

        <div className={`otp-row${shake ? " otp-shake" : ""}`}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              className={`otp-box${digit ? " filled" : ""}${error ? " otp-err" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={idx === 0}
              disabled={loading}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
            />
          ))}
        </div>

        {error && <p className="auth-form-error">{error}</p>}

        <p className="verify-timer">
          {countdown > 0 ? (
            <>Mã hết hạn sau <strong>{formatTime(countdown)}</strong></>
          ) : (
            <span className="verify-expired">Mã đã hết hạn</span>
          )}
        </p>

        <button
          className="auth-submit"
          onClick={() => submitOtp()}
          disabled={loading || otp.some((d) => !d)}
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>

        <div className="resend-row">
          <span>Không nhận được mã? </span>
          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
          >
            {resendLoading
              ? "Đang gửi..."
              : resendCooldown > 0
              ? `Gửi lại (${resendCooldown}s)`
              : "Gửi lại mã"}
          </button>
        </div>
      </div>
    </AuthCard>
  );
}
