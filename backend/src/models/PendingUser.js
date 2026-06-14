const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    studentId: { type: String, default: "" },
    university: { type: String, default: "" },
    faculty: { type: String, default: "" },
    major: { type: String, default: "" },
    academicYear: { type: String, default: "" },
    role: { type: String, default: "student" },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    otpAttempts: { type: Number, default: 0 },
    // TTL index: MongoDB tự xóa document sau khi hết hạn
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
  },
  { timestamps: true }
);

// TTL index: tự xóa sau 10 phút (dù OTP chỉ valid 5 phút)
pendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
pendingUserSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("PendingUser", pendingUserSchema);
