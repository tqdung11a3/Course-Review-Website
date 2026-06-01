const Review = require("../models/Review");
const CourseProof = require("../models/CourseProof");
const Course = require("../models/Course");
const LearningMaterial = require("../models/LearningMaterial");
const ReviewVote = require("../models/ReviewVote");
const ReviewReport = require("../models/ReviewReport");
const { parsePagination, paginationMeta } = require("../utils/pagination");
const { success, fail } = require("../utils/response");
const { createNotification } = require("../utils/notify");

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

  let evidenceFiles = Array.isArray(body.evidenceFiles) ? body.evidenceFiles : [];
  if (!evidenceFiles.length && proof.proofFiles?.length) {
    evidenceFiles = proof.proofFiles;
  }

  try {
    const review = await Review.create({
      userId: req.user._id,
      courseId: body.courseId,
      enrollmentProofId: proof._id,
      semester: body.semester,
      academicYear: body.academicYear,
      lecturerName: body.lecturerName || proof.lecturerName || "",
      grade: body.grade || "",
      hasMandatoryAttendance: !!body.hasMandatoryAttendance,
      wouldTakeAgain: !!body.wouldTakeAgain,
      isAnonymous: !!body.isAnonymous,
      ratings: body.ratings,
      details: body.details || {},
      learnerProfile: body.learnerProfile || {},
      evidenceFiles,
      status: "pending",
    });

    const courseLabel = `${course.courseCode} - ${course.courseName}`;
    await createNotification({
      userId: req.user._id,
      type: "review_submitted",
      title: "Review đã gửi chờ duyệt",
      message: `Review môn ${courseLabel} đã được gửi. Quản trị sẽ xem xét và thông báo kết quả.`,
      reviewId: review._id,
      courseId: course._id,
    });

    return success(res, {
      message: "Review submitted and pending approval",
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

exports.listMyReviews = async (req, res) => {
  const { mergeEvidenceFiles } = require("../utils/reviewEvidence");
  const reviews = await Review.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("courseId", "courseCode courseName")
    .lean();

  const proofIds = reviews.map((r) => r.enrollmentProofId).filter(Boolean);
  const proofs = await CourseProof.find({ _id: { $in: proofIds } }).lean();
  const proofById = Object.fromEntries(proofs.map((p) => [String(p._id), p]));

  return success(res, {
    message: "My reviews",
    data: {
      items: reviews.map((r) => {
        const proof = proofById[String(r.enrollmentProofId)];
        const evidenceFiles = mergeEvidenceFiles(r, proof);
        return {
          ...r,
          courseCode: r.courseId?.courseCode,
          courseName: r.courseId?.courseName,
          evidenceFiles,
        };
      }),
    },
  });
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
  const { mergeEvidenceFiles } = require("../utils/reviewEvidence");
  const review = await Review.findById(req.params.id)
    .populate("userId", "fullName avatarUrl studentId")
    .populate("courseId", "courseCode courseName")
    .lean();

  if (!review) return fail(res, { message: "Review not found", status: 404 });

  const isStaff =
    req.user && (req.user.role === "admin" || req.user.role === "moderator");
  const isOwner = req.user && String(review.userId?._id || review.userId) === String(req.user._id);

  if (review.status !== "published" && !isStaff && !isOwner) {
    return fail(res, { message: "Review not found", status: 404 });
  }

  if (review.isAnonymous && !isStaff && !isOwner) {
    review.userId = null;
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
        hasEvidence: evidenceFiles.length > 0,
      },
    },
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

  const course = await Course.findById(review.courseId).select("courseCode courseName").lean();
  const courseLabel = course ? `${course.courseCode} - ${course.courseName}` : "môn học";

  await createNotification({
    userId: review.userId,
    type: "review_approved",
    title: "Review đã được phê duyệt",
    message: `Review môn ${courseLabel} đã được phê duyệt và hiển thị công khai.${
      req.body.moderationNote ? ` Ghi chú: ${req.body.moderationNote}` : ""
    }`,
    reviewId: review._id,
    courseId: review.courseId,
  });

  return success(res, { message: "Review published", data: { review } });
};

exports.rejectReview = async (req, res) => {
  const note = req.body.moderationNote || "Review không đáp ứng tiêu chí.";
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: "rejected",
        moderationNote: note,
      },
    },
    { new: true }
  );
  if (!review) return fail(res, { message: "Review not found", status: 404 });

  const course = await Course.findById(review.courseId).select("courseCode courseName").lean();
  const courseLabel = course ? `${course.courseCode} - ${course.courseName}` : "môn học";

  await createNotification({
    userId: review.userId,
    type: "review_rejected",
    title: "Review bị từ chối",
    message: `Review môn ${courseLabel} đã bị từ chối. Lý do: ${note}`,
    reviewId: review._id,
    courseId: review.courseId,
  });

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
