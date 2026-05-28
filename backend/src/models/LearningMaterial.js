const mongoose = require("mongoose");

const MATERIAL_TYPES = [
  "textbook",
  "lecture_slide",
  "reference_book",
  "past_exam",
  "video",
  "website",
  "note",
  "lab",
  "project",
  "other",
];

const SOURCE_TYPES = ["lecturer", "library", "internet", "self_made", "senior", "other"];

const USAGE_PURPOSES = [
  "understand_lesson",
  "assignment",
  "lab",
  "project",
  "midterm",
  "final_exam",
  "review_from_scratch",
];

const SUITABLE_FOR = [
  "beginner",
  "average_student",
  "pass_course",
  "high_grade",
  "deep_understanding",
  "limited_time",
];

const RECOMMENDATION_LEVELS = [
  "highly_recommended",
  "recommended",
  "situational",
  "not_recommended",
];

const materialRatingsSchema = new mongoose.Schema(
  {
    usefulness: { type: Number, min: 1, max: 5, default: 3 },
    readability: { type: Number, min: 1, max: 5, default: 3 },
    courseRelevance: { type: Number, min: 1, max: 5, default: 3 },
    necessity: { type: Number, min: 1, max: 5, default: 3 },
  },
  { _id: false }
);

const attachmentFileSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const learningMaterialSchema = new mongoose.Schema(
  {
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    materialType: { type: String, enum: MATERIAL_TYPES, required: true },
    source: { type: String, enum: SOURCE_TYPES, default: "other" },
    linkUrl: { type: String, default: "" },
    attachmentFiles: [attachmentFileSchema],
    authorOrPublisher: { type: String, default: "" },
    versionOrYear: { type: String, default: "" },
    ratings: { type: materialRatingsSchema, default: () => ({}) },
    usagePurposes: [{ type: String, enum: USAGE_PURPOSES }],
    suitableFor: [{ type: String, enum: SUITABLE_FOR }],
    contentSummary: { type: String, default: "" },
    strengths: { type: String, default: "" },
    limitations: { type: String, default: "" },
    effectiveUsageGuide: { type: String, default: "" },
    recommendationLevel: {
      type: String,
      enum: RECOMMENDATION_LEVELS,
      default: "recommended",
      index: true,
    },
    helpfulScore: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

learningMaterialSchema.index({ courseId: 1, materialType: 1 });
learningMaterialSchema.index({ courseId: 1, recommendationLevel: 1 });
learningMaterialSchema.index({ usagePurposes: 1 });
learningMaterialSchema.index({ suitableFor: 1 });

module.exports = mongoose.model("LearningMaterial", learningMaterialSchema);
module.exports.MATERIAL_TYPES = MATERIAL_TYPES;
module.exports.SOURCE_TYPES = SOURCE_TYPES;
module.exports.USAGE_PURPOSES = USAGE_PURPOSES;
module.exports.SUITABLE_FOR = SUITABLE_FOR;
module.exports.RECOMMENDATION_LEVELS = RECOMMENDATION_LEVELS;
