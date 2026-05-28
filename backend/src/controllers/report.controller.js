const ReviewReport = require("../models/ReviewReport");
const Review = require("../models/Review");
const { parsePagination, paginationMeta } = require("../utils/pagination");
const { success, fail } = require("../utils/response");

exports.createReport = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  if (String(review.userId) === String(req.user._id)) {
    return fail(res, { message: "You cannot report your own review", status: 400 });
  }

  const report = await ReviewReport.create({
    userId: req.user._id,
    reviewId: review._id,
    reason: req.body.reason,
    description: req.body.description || "",
    status: "pending",
  });

  await Review.updateOne({ _id: review._id }, { $inc: { reportCount: 1 } });

  return success(res, {
    message: "Report submitted",
    data: { report },
    status: 201,
  });
};

exports.listReports = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    ReviewReport.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email")
      .populate("reviewId", "courseId status helpfulCount")
      .lean(),
    ReviewReport.countDocuments(filter),
  ]);

  return success(res, {
    message: "Reports",
    data: { items, pagination: paginationMeta({ total, page, limit }) },
  });
};

exports.resolveReport = async (req, res) => {
  const { status, resolutionNote, action } = req.body;
  const report = await ReviewReport.findById(req.params.id);
  if (!report) return fail(res, { message: "Report not found", status: 404 });

  report.status = status || "reviewed";
  report.handledBy = req.user._id;
  report.resolutionNote = resolutionNote || "";

  if (action === "hide_review") {
    await Review.updateOne({ _id: report.reviewId }, { $set: { status: "hidden" } });
    report.status = "action_taken";
  } else if (action === "dismiss") {
    report.status = "dismissed";
  }

  await report.save();

  return success(res, { message: "Report resolved", data: { report } });
};
