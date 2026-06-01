const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    courseName: { type: String, required: true, trim: true },
    faculty: { type: String, trim: true, default: "", index: true },
    department: { type: String, trim: true, default: "", index: true },
    credits: { type: Number, min: 0, default: 0 },
    description: { type: String, default: "" },
    prerequisites: { type: String, default: "" }, // Legacy text field (backward-compatible)
    prerequisiteCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    tags: [{ type: String, trim: true }],
    courseType: { type: String, trim: true, default: "" },
    offeredSemesters: [{ type: String, trim: true }],
    teachingLanguage: { type: String, trim: true, default: "" },
    learningMode: { type: String, trim: true, default: "" },
    assessmentMethods: [{ type: String, trim: true }],
    syllabusFiles: [
      {
        fileUrl: { type: String, required: true },
        fileName: { type: String, default: "" },
        fileType: { type: String, default: "" },
        fileSize: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ courseName: "text", courseCode: "text", faculty: "text", department: "text" });
courseSchema.index({ faculty: 1, department: 1, credits: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ courseType: 1, learningMode: 1, teachingLanguage: 1 });

module.exports = mongoose.model("Course", courseSchema);
