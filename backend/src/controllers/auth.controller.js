const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const { success, fail } = require("../utils/response");

function toPublicUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete u.passwordHash;
  return u;
}

exports.register = async (req, res) => {
  const {
    fullName,
    email,
    password,
    studentId,
    university,
    faculty,
    major,
    academicYear,
  } = req.body;

  const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) {
    return fail(res, { message: "Email already registered", status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    studentId,
    university,
    faculty,
    major,
    academicYear,
    role: "student",
  });

  const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });

  return success(res, {
    message: "Registered successfully",
    data: { user: toPublicUser(user), token },
    status: 201,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
    "+passwordHash"
  );
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return fail(res, { message: "Invalid email or password", status: 401 });
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
  const allowed = [
    "fullName",
    "studentId",
    "university",
    "faculty",
    "major",
    "academicYear",
    "avatarUrl",
  ];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  return success(res, { message: "Profile updated", data: { user: toPublicUser(user) } });
};

exports.toPublicUser = toPublicUser;
