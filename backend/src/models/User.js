const mongoose = require("mongoose");

const ROLES = ["student", "admin", "moderator"];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    studentId: { type: String, trim: true, default: "" },
    university: { type: String, trim: true, default: "" },
    faculty: { type: String, trim: true, default: "" },
    major: { type: String, trim: true, default: "" },
    academicYear: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ROLES,
      default: "student",
      index: true,
    },
    isVerifiedStudent: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, role: 1 }, { unique: true });
userSchema.index({ faculty: 1 });
userSchema.index({ university: 1 });
userSchema.index({ studentId: 1, role: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
