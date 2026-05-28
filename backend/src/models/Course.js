const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    courseName: { type: String, required: true, trim: true },
    faculty: { type: String, trim: true, default: "", index: true },
    department: { type: String, trim: true, default: "", index: true },
    credits: { type: Number, min: 0, default: 0 },
    description: { type: String, default: "" },
    prerequisites: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
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

module.exports = mongoose.model("Course", courseSchema);
