import { AUTH_ROLES, ROLE_LABELS } from "../../utils/authConstants";
import { IconMail, IconShield, IconUser } from "./AuthIcons";

const ROLE_OPTIONS = [
  { value: AUTH_ROLES.student, label: ROLE_LABELS.student, icon: IconUser, loginIcon: IconMail },
  { value: AUTH_ROLES.admin, label: ROLE_LABELS.admin, icon: IconShield },
];

export function RoleToggle({ value, onChange, variant = "register" }) {
  return (
    <div className="auth-field">
      <span className="auth-label">
        Vai trò<span className="auth-required"> *</span>
      </span>
      <div className="auth-role-group" role="radiogroup" aria-label="Vai trò">
        {ROLE_OPTIONS.map((option) => {
          const isActive = value === option.value;
          const Icon = variant === "login" && option.loginIcon ? option.loginIcon : option.icon;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`auth-role-btn ${isActive ? "auth-role-btn--active" : ""}`}
              onClick={() => onChange(option.value)}
            >
              <Icon />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
