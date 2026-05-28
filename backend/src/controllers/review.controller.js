const Review = require("../models/Review");
const CourseProof = require("../models/CourseProof");
const Course = require("../models/Course");
const LearningMaterial = require("../models/LearningMaterial");
const ReviewVote = require("../models/ReviewVote");
const ReviewReport = require("../models/ReviewReport");
const { parsePagination, paginationMeta } = require("../utils/pagination");
const { success, fail } = require("../utils/response");

function sanitizeReviewForViewer(review, viewerId) {
  const r = review.toObject ? review.toObject() : { ...review };
  if (r.isAnonymous && String(r.userId?._id || r.userId) !== String(viewerId)) {
    r.userId = null;
  }
  return r;
}

exports.createReview = async (req, res) => {
  const body = req.body;
  const proof = await CourseProof.findById(body.enrollmentProofId);
  if (!proof) {
    return fail(res, { message: "Enrollment proof not found", status: 404 });
  }
  if (String(proof.userId) !== String(req.user._id)) {
    return fail(res, { message: "This proof does not belong to you", status: 403 });
  }
  if (proof.status !== "approved") {
    return fail(res, {
      message:
        "You are not allowed to review this course because your proof has not been approved",
      status: 403,
    });
  }
  if (String(proof.courseId) !== String(body.courseId)) {
    return fail(res, { message: "Proof does not match this course", status: 400 });
  }
  if (String(proof.semester) !== String(body.semester) || String(proof.academicYear) !== String(body.academicYear)) {
    return fail(res, {
      message: "Review semester/academic year must match the approved proof",
      status: 400,
    });
  }

  const course = await Course.findById(body.courseId);
  if (!course) return fail(res, { message: "Course not found", status: 404 });

  try {
    const review = await Review.create({
      userId: req.user._id,
      courseId: body.courseId,
      enrollmentProofId: proof._id,
      semester: body.semester,
      academicYear: body.academicYear,
      lecturerName: body.lecturerName || proof.lecturerName || "",
      isAnonymous: !!body.isAnonymous,
      ratings: body.ratings,
      details: body.details || {},
      learnerProfile: body.learnerProfile || {},
      evidenceFiles: Array.isArray(body.evidenceFiles) ? body.evidenceFiles : [],
      status: "pending",
    });

    return success(res, {
      message: "Review created successfully",
      data: { review: sanitizeReviewForViewer(review, req.user._id) },
      status: 201,
    });
  } catch (err) {
    if (err.code === 11000) {
      return fail(res, {
        message: "You have already submitted a review for this course in this semester and academic year",
        status: 409,
      });
    }
    throw err;
  }
};

exports.listReviews = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { courseId, status, sort = "-createdAt" } = req.query;
  const filter = {};
  if (courseId) filter.courseId = courseId;

  const isStaff = req.user && (req.user.role === "admin" || req.user.role === "moderator");
  if (!isStaff) {
    filter.status = "published";
  } else if (status) {
    filter.status = status;
  }

  const sortFieldRaw = String(sort).replace(/^-/, "");
  const allowedReviewSort = new Set(["createdAt", "helpfulCount", "notHelpfulCount", "updatedAt"]);
  const sortField = allowedReviewSort.has(sortFieldRaw) ? sortFieldRaw : "createdAt";
  const sortDir = String(sort).startsWith("-") ? -1 : 1;

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName avatarUrl")
      .lean(),
    Review.countDocuments(filter),
  ]);

  const viewerId = req.user?._id;
  const mapped = items.map((r) => {
    if (r.isAnonymous && String(r.userId?._id || r.userId) !== String(viewerId)) {
      r.userId = null;
    }
    return r;
  });

  return success(res, {
    message: "Reviews retrieved",
    data: { items: mapped, pagination: paginationMeta({ total, page, limit }) },
  });
};

exports.getReview = async (req, res) => {
  const review = await Review.findById(req.params.id).populate("userId", "fullName avatarUrl");
  if (!review) return fail(res, { message: "Review not found", status: 404 });

  const isStaff =
    req.user && (req.user.role === "admin" || req.user.role === "moderator");
  const isOwner = req.user && String(review.userId?._id || review.userId) === String(req.user._id);

  if (review.status !== "published" && !isStaff && !isOwner) {
    return fail(res, { message: "Review not found", status: 404 });
  }

  return success(res, {
    message: "OK",
    data: { review: sanitizeReviewForViewer(review, req.user?._id) },
  });
};

exports.updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  if (String(review.userId) !== String(req.user._id)) {
    return fail(res, { message: "You can only edit your own review", status: 403 });
  }

  const allowed = [
    "lecturerName",
    "isAnonymous",
    "ratings",
    "details",
    "learnerProfile",
    "evidenceFiles",
    "semester",
    "academicYear",
  ];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  if (updates.semester || updates.academicYear) {
    const proof = await CourseProof.findById(review.enrollmentProofId);
    if (proof) {
      const semMismatch =
        updates.semester && String(updates.semester) !== String(proof.semester);
      const yearMismatch =
        updates.academicYear && String(updates.academicYear) !== String(proof.academicYear);
      if (semMismatch || yearMismatch) {
        return fail(res, {
          message: "Semester and academic year must stay aligned with enrollment proof",
          status: 400,
        });
      }
    }
  }

  Object.assign(review, updates);
  if (review.status === "rejected") {
    review.status = "pending";
    review.moderationNote = "";
  }
  await review.save();

  return success(res, {
    message: "Review updated",
    data: { review: sanitizeReviewForViewer(review, req.user._id) },
  });
};

exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  if (String(review.userId) !== String(req.user._id)) {
    return fail(res, { message: "You can only delete your own review", status: 403 });
  }

  await Promise.all([
    LearningMaterial.deleteMany({ reviewId: review._id }),
    ReviewVote.deleteMany({ reviewId: review._id }),
    ReviewReport.deleteMany({ reviewId: review._id }),
    Review.deleteOne({ _id: review._id }),
  ]);
  return success(res, { message: "Review deleted", data: {} });
};

exports.publishReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $set: { status: "published", moderationNote: req.body.moderationNote || "" } },
    { new: true }
  );
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  return success(res, { message: "Review published", data: { review } });
};

exports.rejectReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: "rejected",
        moderationNote: req.body.moderationNote || "Rejected",
      },
    },
    { new: true }
  );
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  return success(res, { message: "Review rejected", data: { review } });
};

exports.hideReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $set: { status: "hidden", moderationNote: req.body.moderationNote || "" } },
    { new: true }
  );
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  return success(res, { message: "Review hidden", data: { review } });
};
