const CourseProof = require("../models/CourseProof");
const Course = require("../models/Course");
const User = require("../models/User");
const { success, fail } = require("../utils/response");
const { parsePagination, paginationMeta } = require("../utils/pagination");

exports.createProof = async (req, res) => {
  const { courseId, semester, academicYear, lecturerName, proofFiles } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return fail(res, { message: "Course not found", status: 404 });

  const files = Array.isArray(proofFiles) ? proofFiles : [];

  const proof = await CourseProof.create({
    userId: req.user._id,
    courseId,
    semester,
    academicYear,
    lecturerName,
    proofFiles: files,
    status: "approved",
    reviewedBy: req.user._id,
  });

  return success(res, {
    message: "Course proof submitted successfully",
    data: { proof },
    status: 201,
  });
};

exports.listMyProofs = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    CourseProof.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("courseId", "courseCode courseName faculty")
      .lean(),
    CourseProof.countDocuments({ userId: req.user._id }),
  ]);

  return success(res, {
    message: "OK",
    data: { items, pagination: paginationMeta({ total, page, limit }) },
  });
};

exports.listPendingProofs = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { status: "pending" };
  const [items, total] = await Promise.all([
    CourseProof.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email studentId university faculty")
      .populate("courseId", "courseCode courseName")
      .lean(),
    CourseProof.countDocuments(filter),
  ]);

  return success(res, {
    message: "Pending proofs",
    data: { items, pagination: paginationMeta({ total, page, limit }) },
  });
};

exports.approveProof = async (req, res) => {
  const proof = await CourseProof.findById(req.params.id);
  if (!proof) return fail(res, { message: "Proof not found", status: 404 });
  if (proof.status !== "pending") {
    return fail(res, { message: "Proof is not pending", status: 400 });
  }

  proof.status = "approved";
  proof.reviewedBy = req.user._id;
  proof.rejectReason = "";
  await proof.save();

  await User.findByIdAndUpdate(proof.userId, {
    $set: { isVerifiedStudent: true },
  });

  return success(res, { message: "Proof approved", data: { proof } });
};

exports.rejectProof = async (req, res) => {
  const { rejectReason } = req.body;
  const proof = await CourseProof.findById(req.params.id);
  if (!proof) return fail(res, { message: "Proof not found", status: 404 });
  if (proof.status !== "pending") {
    return fail(res, { message: "Proof is not pending", status: 400 });
  }

  proof.status = "rejected";
  proof.reviewedBy = req.user._id;
  proof.rejectReason = rejectReason || "Rejected";
  await proof.save();

  return success(res, { message: "Proof rejected", data: { proof } });
};
