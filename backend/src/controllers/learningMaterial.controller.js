const LearningMaterial = require("../models/LearningMaterial");
const Review = require("../models/Review");
const { parsePagination, paginationMeta } = require("../utils/pagination");
const { success, fail } = require("../utils/response");

function computeHelpfulScore(ratings) {
  const r = ratings || {};
  const vals = [
    Number(r.usefulness) || 0,
    Number(r.readability) || 0,
    Number(r.courseRelevance) || 0,
    Number(r.necessity) || 0,
  ].filter((n) => n > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

exports.createMaterial = async (req, res) => {
  const reviewId = req.params.reviewId || req.params.id;
  const review = await Review.findById(reviewId);
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  if (String(review.userId) !== String(req.user._id)) {
    return fail(res, { message: "You can only add materials to your own review", status: 403 });
  }

  const body = req.body;
  const helpfulScore = computeHelpfulScore(body.ratings);

  const material = await LearningMaterial.create({
    reviewId: review._id,
    courseId: review.courseId,
    userId: req.user._id,
    title: body.title,
    materialType: body.materialType,
    source: body.source,
    linkUrl: body.linkUrl || "",
    attachmentFiles: Array.isArray(body.attachmentFiles) ? body.attachmentFiles : [],
    authorOrPublisher: body.authorOrPublisher,
    versionOrYear: body.versionOrYear,
    ratings: body.ratings || {},
    usagePurposes: body.usagePurposes || [],
    suitableFor: body.suitableFor || [],
    contentSummary: body.contentSummary,
    strengths: body.strengths,
    limitations: body.limitations,
    effectiveUsageGuide: body.effectiveUsageGuide,
    recommendationLevel: body.recommendationLevel || "recommended",
    helpfulScore,
  });

  return success(res, {
    message: "Learning material created",
    data: { material },
    status: 201,
  });
};

exports.listMaterialsByCourse = async (req, res) => {
  const courseId = req.params.id;
  const { page, limit, skip } = parsePagination(req.query);
  const {
    type,
    materialType,
    purpose,
    suitableFor,
    recommendationLevel,
    minHelpful,
    sort = "-helpfulScore",
  } = req.query;

  const filter = { courseId };
  const mt = type || materialType;
  if (mt) filter.materialType = mt;
  if (recommendationLevel) filter.recommendationLevel = recommendationLevel;
  if (purpose) {
    filter.usagePurposes = purpose;
  }
  if (suitableFor) {
    filter.suitableFor = suitableFor;
  }
  if (minHelpful !== undefined && minHelpful !== "") {
    filter.helpfulScore = { $gte: Number(minHelpful) };
  }

  const sortFieldRaw = String(sort).replace(/^-/, "");
  const allowedMatSort = new Set(["helpfulScore", "createdAt", "updatedAt"]);
  const sortField = allowedMatSort.has(sortFieldRaw) ? sortFieldRaw : "helpfulScore";
  const sortDir = String(sort).startsWith("-") ? -1 : 1;

  const [items, total] = await Promise.all([
    LearningMaterial.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    LearningMaterial.countDocuments(filter),
  ]);

  return success(res, {
    message: "Materials retrieved",
    data: { items, pagination: paginationMeta({ total, page, limit }) },
  });
};

exports.getMaterial = async (req, res) => {
  const material = await LearningMaterial.findById(req.params.id);
  if (!material) return fail(res, { message: "Material not found", status: 404 });
  return success(res, { message: "OK", data: { material } });
};

exports.updateMaterial = async (req, res) => {
  const material = await LearningMaterial.findById(req.params.id);
  if (!material) return fail(res, { message: "Material not found", status: 404 });
  if (String(material.userId) !== String(req.user._id)) {
    return fail(res, { message: "You can only edit your own materials", status: 403 });
  }

  const allowed = [
    "title",
    "materialType",
    "source",
    "linkUrl",
    "attachmentFiles",
    "authorOrPublisher",
    "versionOrYear",
    "ratings",
    "usagePurposes",
    "suitableFor",
    "contentSummary",
    "strengths",
    "limitations",
    "effectiveUsageGuide",
    "recommendationLevel",
  ];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  if (updates.ratings) {
    updates.helpfulScore = computeHelpfulScore(updates.ratings);
  }

  Object.assign(material, updates);
  await material.save();

  return success(res, { message: "Material updated", data: { material } });
};

exports.deleteMaterial = async (req, res) => {
  const material = await LearningMaterial.findById(req.params.id);
  if (!material) return fail(res, { message: "Material not found", status: 404 });
  if (String(material.userId) !== String(req.user._id)) {
    return fail(res, { message: "You can only delete your own materials", status: 403 });
  }
  await material.deleteOne();
  return success(res, { message: "Material deleted", data: {} });
};
