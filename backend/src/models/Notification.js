const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "review_approved",
  "review_rejected",
  "review_submitted",
];

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: "" },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", default: null },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
