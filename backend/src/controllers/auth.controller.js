const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const { generateToken } = require("../utils/generateToken");
const { success, fail } = require("../utils/response");
const { generateOtp, hashOtp, verifyOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/mailer");

const SCHOOL_EMAIL_SUFFIX = "@sis.hust.edu.vn";

function isSchoolEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase()
    .endsWith(SCHOOL_EMAIL_SUFFIX);
}

function toPublicUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete u.passwordHash;
  delete u.emailOtpHash;
  delete u.emailOtpExpiresAt;
  delete u.emailOtpAttempts;
  return u;
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// Chỉ lưu tạm vào PendingUser, CHƯA tạo User thật
exports.register = async (req, res) => {
  const { fullName, email, password, studentId, university, faculty, major, academicYear } =
    req.body;

  const normalizedEmail = String(email).toLowerCase().trim();
  if (!isSchoolEmail(normalizedEmail)) {
    return fail(res, {
      message: "Only school emails (@sis.hust.edu.vn) are accepted",
      status: 400,
    });
  }

  const normalizedRole = "student";
  if (
    req.body.role &&
    String(req.body.role).trim().toLowerCase() !== "student"
  ) {
    return fail(res, {
      message: "Registration is only available for students",
      status: 403,
    });
  }

  // Kiểm tra email đã tồn tại trong User thật chưa
  const existsUser = await User.findOne({ email: normalizedEmail, role: normalizedRole });
  if (existsUser) {
    return fail(res, { message: "Email already registered for this role", status: 409 });
  }

  const trimmedStudentId = String(studentId || "").trim();

  if (!trimmedStudentId) {
    return fail(res, { message: "studentId is required for students", status: 400 });
  }

  const existsStudentId = await User.findOne({ studentId: trimmedStudentId, role: "student" });
  if (existsStudentId) {
    return fail(res, { message: "Student ID already registered", status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

  // Upsert PendingUser (cho phép gửi lại OTP nếu đã pending trước đó)
  await PendingUser.findOneAndUpdate(
    { email: normalizedEmail, role: normalizedRole },
    {
      fullName,
      passwordHash,
      studentId: trimmedStudentId,
      university: university || "",
      faculty: faculty || "",
      major: major || "",
      academicYear: academicYear || "",
      otpHash,
      otpExpiresAt: otpExpires,
      otpAttempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    { upsert: true, new: true }
  );

  try {
    await sendOtpEmail(normalizedEmail, otp);
  } catch (err) {
    console.error("[register] Failed to send OTP email:", err.message);
  }

  return success(res, {
    message: "Đăng ký thành công. Vui lòng kiểm tra email để nhập mã xác thực.",
    data: { email: normalizedEmail, requiresVerification: true },
    status: 201,
  });
};

// ─── VERIFY EMAIL ──────────────────────────────────────────────────────────────
// Xác thực OTP → tạo User thật → xóa PendingUser
exports.verifyEmail = async (req, res) => {
  const { email, otpCode } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  const pending = await PendingUser.findOne({ email: normalizedEmail });
  if (!pending) {
    return fail(res, {
      message: "Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại.",
      status: 404,
    });
  }

  if (pending.otpAttempts >= 5) {
    return fail(res, {
      message: "Bạn đã nhập sai quá nhiều lần. Vui lòng đăng ký lại để nhận mã mới.",
      status: 429,
    });
  }

  if (new Date() > pending.otpExpiresAt) {
    return fail(res, {
      message: "Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.",
      status: 400,
      data: { expired: true },
    });
  }

  if (!verifyOtp(otpCode, pending.otpHash)) {
    pending.otpAttempts += 1;
    await pending.save();
    const remaining = 5 - pending.otpAttempts;
    return fail(res, {
      message: `Mã xác thực không đúng. Bạn còn ${remaining} lần thử.`,
      status: 400,
      data: { attemptsRemaining: remaining },
    });
  }

  // OTP đúng → tạo User thật vào database
  const user = await User.create({
    fullName: pending.fullName,
    email: pending.email,
    passwordHash: pending.passwordHash,
    studentId: pending.studentId,
    university: pending.university,
    faculty: pending.faculty,
    major: pending.major,
    academicYear: pending.academicYear,
    role: pending.role,
    isEmailVerified: true,
  });

  // Xóa bản ghi tạm
  await PendingUser.deleteOne({ _id: pending._id });

  const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

  return success(res, {
    message: "Xác thực email thành công!",
    data: { user: toPublicUser(user), token },
  });
};

// ─── RESEND OTP ────────────────────────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  const pending = await PendingUser.findOne({ email: normalizedEmail });
  if (!pending) {
    return fail(res, {
      message: "Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại.",
      status: 404,
    });
  }

  // Rate limit: 60s giữa các lần gửi lại
  const createdAt = new Date(pending.otpExpiresAt.getTime() - 5 * 60 * 1000);
  const elapsed = Date.now() - createdAt.getTime();
  if (elapsed < 60 * 1000) {
    const waitSecs = Math.ceil((60 * 1000 - elapsed) / 1000);
    return fail(res, {
      message: `Vui lòng đợi ${waitSecs} giây trước khi gửi lại mã.`,
      status: 429,
      data: { waitSeconds: waitSecs },
    });
  }

  const otp = generateOtp();
  pending.otpHash = hashOtp(otp);
  pending.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  pending.otpAttempts = 0;
  pending.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pending.save();

  try {
    await sendOtpEmail(normalizedEmail, otp);
  } catch (err) {
    console.error("[resendOtp] Failed to send OTP email:", err.message);
    return fail(res, { message: "Gửi email thất bại. Vui lòng thử lại.", status: 500 });
  }

  return success(res, {
    message: "Đã gửi lại mã xác thực. Vui lòng kiểm tra email.",
    data: { email: normalizedEmail },
  });
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  const requestedRole = String(role || "").trim().toLowerCase();
  const user = await User.findOne({
    email: String(email).toLowerCase().trim(),
    role: requestedRole,
  }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return fail(res, { message: "Invalid email or password", status: 401 });
  }

  // Tài khoản cũ chưa có isEmailVerified thì cho qua (backward compat)
  if (user.isEmailVerified === false) {
    return fail(res, {
      message: "Tài khoản chưa được xác thực email. Vui lòng xác thực để đăng nhập.",
      status: 403,
      data: { requiresVerification: true, email: user.email },
    });
  }

  const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });
  user.passwordHash = undefined;
  return success(res, {
    message: "Login successful",
    data: { user: toPublicUser(user), token },
  });
};

exports.logout = async (req, res) => {
  return success(res, { message: "Logged out successfully", data: {} });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user._id);
  return success(res, { message: "OK", data: { user: toPublicUser(user) } });
};

exports.updateProfile = async (req, res) => {
  const allowed = ["fullName", "studentId", "university", "faculty", "major", "academicYear", "avatarUrl"];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  return success(res, { message: "Profile updated", data: { user: toPublicUser(user) } });
};

exports.toPublicUser = toPublicUser;
