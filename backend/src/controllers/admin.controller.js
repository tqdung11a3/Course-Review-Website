const Review = require("../models/Review");
const ReviewReport = require("../models/ReviewReport");
const LearningMaterial = require("../models/LearningMaterial");
const CourseProof = require("../models/CourseProof");
const { parsePagination, paginationMeta } = require("../utils/pagination");
const { success, fail } = require("../utils/response");
const { mergeEvidenceFiles } = require("../utils/reviewEvidence");

function mapPendingReview(review, proof) {
  const course = review.courseId;
  const author = review.userId;
  const evidenceFiles = mergeEvidenceFiles(review, proof);
  return {
    ...review,
    courseCode: course?.courseCode || "",
    courseName: course?.courseName || "",
    authorName: author?.fullName || "Ẩn danh",
    evidenceFiles,
    hasEvidence: evidenceFiles.length > 0,
  };
}

exports.getModerationStats = async (req, res) => {
  const [pendingReviews, pendingReports, publishedReviews, rejectedReviews] = await Promise.all([
    Review.countDocuments({ status: "pending" }),
    ReviewReport.countDocuments({ status: "pending" }),
    Review.countDocuments({ status: "published" }),
    Review.countDocuments({ status: "rejected" }),
  ]);

  return success(res, {
    message: "Moderation stats",
    data: {
      pendingReviews,
      pendingReports,
      publishedReviews,
      rejectedReviews,
    },
  });
};

exports.listPendingReviews = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [items, total] = await Promise.all([
    Review.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email")
      .populate("courseId", "courseCode courseName")
      .lean(),
    Review.countDocuments({ status: "pending" }),
  ]);

  const proofIds = items.map((r) => r.enrollmentProofId).filter(Boolean);
  const proofs = await CourseProof.find({ _id: { $in: proofIds } }).lean();
  const proofById = Object.fromEntries(proofs.map((p) => [String(p._id), p]));

  return success(res, {
    message: "Pending reviews",
    data: {
      items: items.map((r) => mapPendingReview(r, proofById[String(r.enrollmentProofId)])),
      pagination: paginationMeta({ total, page, limit }),
    },
  });
};

exports.getReviewForModeration = async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("userId", "fullName email studentId")
    .populate("courseId", "courseCode courseName faculty credits")
    .lean();

  if (!review) {
    return fail(res, { message: "Review not found", status: 404 });
  }

  const [materials, proof] = await Promise.all([
    LearningMaterial.find({ reviewId: review._id }).lean(),
    review.enrollmentProofId
      ? CourseProof.findById(review.enrollmentProofId).lean()
      : Promise.resolve(null),
  ]);

  const evidenceFiles = mergeEvidenceFiles(review, proof);

  return success(res, {
    message: "OK",
    data: {
      review: {
        ...review,
        materials,
        evidenceFiles,
        enrollmentProof: proof,
        hasEvidence: evidenceFiles.length > 0,
      },
    },
  });
};
