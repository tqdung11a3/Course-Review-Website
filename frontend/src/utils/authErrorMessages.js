const API_ERROR_MAP = {
  "Invalid email or password": "Email hoặc mật khẩu không đúng",
  "Role does not match this account": "Vai trò không khớp với tài khoản",
  "Email already registered": "Email đã được đăng ký",
  "Email already registered for this role": "Email đã được đăng ký với vai trò này",
  "Student ID already registered": "Mã sinh viên đã được đăng ký",
  "Only school emails (@sis.hust.edu.vn) are accepted":
    "Chỉ chấp nhận email trường @sis.hust.edu.vn",
  "studentId is required for students": "Vui lòng nhập mã sinh viên",
  "confirmPassword does not match password": "Mật khẩu xác nhận không khớp",
};

export function translateAuthError(message) {
  if (!message) return "Đã xảy ra lỗi, vui lòng thử lại";
  return API_ERROR_MAP[message] || message;
}
