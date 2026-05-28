const mongoose = require("mongoose");

const REVIEW_STATUSES = ["pending", "published", "rejected", "hidden"];

const ratingsSchema = new mongoose.Schema(
  {
    overall: { type: Number, min: 1, max: 5, required: true },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    workload: { type: Number, min: 1, max: 5, required: true },
    usefulness: { type: Number, min: 1, max: 5, required: true },
    gradingFairness: { type: Number, min: 1, max: 5, required: true },
    teachingQuality: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const detailsSchema = new mongoose.Schema(
  {
    courseContent: { type: String, default: "" },
    assignmentWorkload: { type: String, default: "" },
    examFormat: { type: String, default: "" },
    gradingMethod: { type: String, default: "" },
    lecturerRequirements: { type: String, default: "" },
    effectiveStudyTips: { type: String, default: "" },
    commonDifficulties: { type: String, default: "" },
  },
  { _id: false }
);

const learnerProfileSchema = new mongoose.Schema(
  {
    selfRatedLevel: {
      type: String,
      enum: ["beginner", "average", "good", "advanced"],
      default: "average",
    },
    targetGrade: {
      type: String,
      enum: ["pass", "good", "excellent"],
      default: "pass",
    },
    learningStyle: {
      type: String,
      enum: ["self-study", "lecture-based", "practice-based", "group-study"],
      default: "lecture-based",
    },
    workloadTolerance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    studyOrientation: {
      type: String,
      enum: ["theory", "practical", "research", "project"],
      default: "theory",
    },
  },
  { _id: false }
);

const evidenceFileSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    enrollmentProofId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProof",
      required: true,
      index: true,
    },
    semester: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    lecturerName: { type: String, trim: true, default: "" },
    isAnonymous: { type: Boolean, default: false },
    ratings: { type: ratingsSchema, required: true },
    details: { type: detailsSchema, default: () => ({}) },
    learnerProfile: { type: learnerProfileSchema, default: () => ({}) },
    evidenceFiles: [evidenceFileSchema],
    status: {
      type: String,
      enum: REVIEW_STATUSES,
      default: "pending",
      index: true,
    },
    moderationNote: { type: String, default: "" },
    helpfulCount: { type: Number, default: 0, min: 0 },
    notHelpfulCount: { type: Number, default: 0, min: 0 },
    reportCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

reviewSchema.index(
  { userId: 1, courseId: 1, semester: 1, academicYear: 1 },
  { unique: true, name: "one_review_per_course_semester_year" }
);
reviewSchema.index({ courseId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ helpfulCount: -1 });

module.exports = mongoose.model("Review", reviewSchema);
module.exports.REVIEW_STATUSES = REVIEW_STATUSES;
