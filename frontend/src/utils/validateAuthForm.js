import { SCHOOL_EMAIL_SUFFIX } from "./authConstants";

export function isSchoolEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase()
    .endsWith(SCHOOL_EMAIL_SUFFIX);
}

export function validateRegisterForm(form) {
  const errors = {};

  if (!form.fullName?.trim()) {
    errors.fullName = "Vui lòng nhập họ và tên";
  }

  if (!form.email?.trim()) {
    errors.email = "Vui lòng nhập email trường";
  } else if (!isSchoolEmail(form.email)) {
    errors.email = `Chỉ chấp nhận email trường ${SCHOOL_EMAIL_SUFFIX}`;
  }

  if (form.role === "student" && !form.studentId?.trim()) {
    errors.studentId = "Vui lòng nhập mã sinh viên";
  }

  if (!form.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (form.password.length < 6) {
    errors.password = "Mật khẩu tối thiểu 6 ký tự";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return errors;
}

export function validateLoginForm(form) {
  const errors = {};

  if (!form.email?.trim()) {
    errors.email = "Vui lòng nhập email trường";
  }

  if (!form.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  }

  return errors;
}
