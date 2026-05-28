const mongoose = require("mongoose");

const REPORT_REASONS = [
  "spam",
  "misinformation",
  "personal_attack",
  "privacy_violation",
  "copyright_violation",
  "off_topic",
  "other",
];

const REPORT_STATUSES = ["pending", "reviewed", "dismissed", "action_taken"];

const reviewReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true, index: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "pending",
      index: true,
    },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ReviewReport", reviewReportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
module.exports.REPORT_STATUSES = REPORT_STATUSES;
