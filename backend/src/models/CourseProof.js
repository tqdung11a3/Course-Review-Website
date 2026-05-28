const mongoose = require("mongoose");

const PROOF_STATUSES = ["pending", "approved", "rejected"];

const proofFileSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const courseProofSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    semester: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    lecturerName: { type: String, trim: true, default: "" },
    proofFiles: [proofFileSchema],
    status: {
      type: String,
      enum: PROOF_STATUSES,
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectReason: { type: String, default: "" },
  },
  { timestamps: true }
);

courseProofSchema.index({ userId: 1, courseId: 1, semester: 1, academicYear: 1 });
courseProofSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("CourseProof", courseProofSchema);
module.exports.PROOF_STATUSES = PROOF_STATUSES;
