const Course = require("../models/Course");
const Review = require("../models/Review");
const ReviewVote = require("../models/ReviewVote");
const LearningMaterial = require("../models/LearningMaterial");
const CourseProof = require("../models/CourseProof");
const { parsePagination, paginationMeta } = require("../utils/pagination");
const { escapeRegex } = require("../utils/escapeRegex");
const { rankReviews } = require("../utils/ranking");
const { mergeEvidenceFiles } = require("../utils/reviewEvidence");
const { success, fail } = require("../utils/response");

function normalizeStringArray(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((x) => String(x || "").trim())
      .filter(Boolean);
  }
  return String(input)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeFileArray(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((f) => f && f.fileUrl)
    .map((f) => ({
      fileUrl: String(f.fileUrl || "").trim(),
      fileName: String(f.fileName || "").trim(),
      fileType: String(f.fileType || "").trim(),
      fileSize: Number(f.fileSize || 0),
      uploadedAt: f.uploadedAt ? new Date(f.uploadedAt) : new Date(),
    }));
}

function normalizeCoursePayload(rawPayload, { includeRequiredDefaults = false } = {}) {
  const payload = { ...rawPayload };
  if (payload.courseCode !== undefined) {
    payload.courseCode = String(payload.courseCode).toUpperCase().trim();
  }
  if (payload.tags !== undefined || includeRequiredDefaults) {
    payload.tags = normalizeStringArray(payload.tags);
  }
  if (payload.offeredSemesters !== undefined || includeRequiredDefaults) {
    payload.offeredSemesters = normalizeStringArray(payload.offeredSemesters);
  }
  if (payload.assessmentMethods !== undefined || includeRequiredDefaults) {
    payload.assessmentMethods = normalizeStringArray(payload.assessmentMethods);
  }
  if (payload.prerequisiteCourseIds !== undefined || includeRequiredDefaults) {
    payload.prerequisiteCourseIds = normalizeStringArray(payload.prerequisiteCourseIds);
  }
  if (payload.syllabusFiles !== undefined || includeRequiredDefaults) {
    payload.syllabusFiles = normalizeFileArray(payload.syllabusFiles);
  }
  return payload;
}

exports.listCourses = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const {
    search,
    faculty,
    department,
    credits,
    tag,
    tags,
    sort = "-createdAt",
  } = req.query;

  const filter = {};

  if (faculty) filter.faculty = new RegExp(`^${escapeRegex(faculty)}$`, "i");
  if (department) filter.department = new RegExp(`^${escapeRegex(department)}$`, "i");
  if (credits !== undefined && credits !== "") {
    filter.credits = Number(credits);
  }

  const tagList = [];
  if (tag) tagList.push(tag);
  if (tags) {
    String(tags)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tagList.push(t));
  }
  if (tagList.length) {
    filter.tags = { $in: tagList };
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { courseName: rx },
      { courseCode: rx },
      { faculty: rx },
      { department: rx },
    ];
  }

  const sortFieldRaw = String(sort).replace(/^-/, "");
  const allowedSort = new Set(["createdAt", "courseName", "courseCode", "credits", "updatedAt"]);
  const sortField = allowedSort.has(sortFieldRaw) ? sortFieldRaw : "createdAt";
  const sortDir = String(sort).startsWith("-") ? -1 : 1;
  const sortObj = { [sortField]: sortDir };

  const [items, total] = await Promise.all([
    Course.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
    Course.countDocuments(filter),
  ]);

  const courseIds = items.map((c) => c._id);
  let statsByCourse = {};
  if (courseIds.length) {
    const statsAgg = await Review.aggregate([
      { $match: { courseId: { $in: courseIds }, status: "published" } },
      {
        $group: {
          _id: "$courseId",
          avgRating: { $avg: "$ratings.overall" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    statsByCourse = Object.fromEntries(
      statsAgg.map((s) => [
        String(s._id),
        {
          avgRating: round2(s.avgRating),
          reviewCount: s.reviewCount || 0,
        },
      ])
    );
  }

  const enriched = items.map((course) => {
    const stats = statsByCourse[String(course._id)] || {
      avgRating: null,
      reviewCount: 0,
    };
    return { ...course, ...stats };
  });

  return success(res, {
    message: "Courses retrieved",
    data: {
      items: enriched,
      pagination: paginationMeta({ total, page, limit }),
    },
  });
};

exports.getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return fail(res, { message: "Course not found", status: 404 });
  return success(res, { message: "OK", data: { course } });
};

exports.createCourse = async (req, res) => {
  const payload = normalizeCoursePayload(
    { ...req.body, createdBy: req.user._id },
    { includeRequiredDefaults: true }
  );
  const course = await Course.create(payload);
  return success(res, {
    message: "Course created successfully",
    data: { course },
    status: 201,
  });
};

exports.updateCourse = async (req, res) => {
  const updates = normalizeCoursePayload(req.body);
  const course = await Course.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
  if (!course) return fail(res, { message: "Course not found", status: 404 });
  return success(res, { message: "Course updated", data: { course } });
};

exports.deleteCourse = async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return fail(res, { message: "Course not found", status: 404 });
  return success(res, { message: "Course deleted", data: {} });
};

exports.listCourseReviews = async (req, res) => {
  const courseId = req.params.id;
  const { page, limit, skip } = parsePagination(req.query);
  const {
    status,
    sort = "-helpfulCount",
    minOverall,
    overall,
    difficulty,
    semester,
    academicYear,
    lecturerName,
  } = req.query;

  const filter = { courseId };
  const isStaff = req.user && (req.user.role === "admin" || req.user.role === "moderator");
  if (!isStaff) {
    filter.status = "published";
  } else if (status) {
    filter.status = status;
  }

  if (overall !== undefined && overall !== "") {
    filter["ratings.overall"] = Number(overall);
  } else if (minOverall !== undefined && minOverall !== "") {
    filter["ratings.overall"] = { $gte: Number(minOverall) };
  }
  if (difficulty !== undefined && difficulty !== "") {
    filter["ratings.difficulty"] = Number(difficulty);
  }
  if (semester) filter.semester = String(semester).trim();
  if (academicYear) filter.academicYear = String(academicYear).trim();
  if (lecturerName) filter.lecturerName = String(lecturerName).trim();

  const sortKey = String(sort);
  let sortObj = { helpfulCount: -1, createdAt: -1 };
  if (sortKey === "-createdAt" || sortKey === "createdAt") {
    sortObj = { createdAt: sortKey.startsWith("-") ? -1 : 1 };
  } else if (sortKey === "-notHelpfulCount" || sortKey === "notHelpfulCount") {
    sortObj = { notHelpfulCount: sortKey.startsWith("-") ? -1 : 1, createdAt: -1 };
  } else if (sortKey === "-overall" || sortKey === "overall") {
    sortObj = { "ratings.overall": sortKey.startsWith("-") ? -1 : 1, helpfulCount: -1 };
  }

  const facetFilter = { courseId };
  if (!isStaff) facetFilter.status = "published";
  else if (status) facetFilter.status = status;

  const [items, total, semesters, academicYears, lecturerNames] = await Promise.all([
    Review.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName avatarUrl")
      .lean(),
    Review.countDocuments(filter),
    Review.distinct("semester", facetFilter),
    Review.distinct("academicYear", facetFilter),
    Review.distinct("lecturerName", facetFilter),
  ]);

  const proofIds = [...new Set(items.map((r) => r.enrollmentProofId).filter(Boolean))];
  const proofs = proofIds.length
    ? await CourseProof.find({ _id: { $in: proofIds } }).lean()
    : [];
  const proofById = Object.fromEntries(proofs.map((p) => [String(p._id), p]));

  const reviewIds = items.map((r) => r._id);
  const materialsByReview = {};
  if (reviewIds.length) {
    const materials = await LearningMaterial.find({ reviewId: { $in: reviewIds } })
      .sort({ recommendationLevel: 1, createdAt: -1 })
      .lean();
    for (const m of materials) {
      const key = String(m.reviewId);
      if (!materialsByReview[key]) materialsByReview[key] = [];
      materialsByReview[key].push(m);
    }
  }

  let voteByReview = {};
  if (req.user && reviewIds.length) {
    const votes = await ReviewVote.find({
      userId: req.user._id,
      reviewId: { $in: reviewIds },
    }).lean();
    voteByReview = Object.fromEntries(votes.map((v) => [String(v.reviewId), v.voteType]));
  }

  const mapped = items.map((r) => {
    const uid = r.userId?._id || r.userId;
    if (r.isAnonymous && (!req.user || String(uid) !== String(req.user._id))) {
      r.userId = null;
    }
    const proof = proofById[String(r.enrollmentProofId)];
    const evidenceFiles = mergeEvidenceFiles(r, proof);
    return {
      ...r,
      materials: materialsByReview[String(r._id)] || [],
      userVote: voteByReview[String(r._id)] || null,
      evidenceFiles,
      hasEvidence: evidenceFiles.length > 0,
    };
  });

  return success(res, {
    message: "Reviews retrieved",
    data: {
      items: mapped,
      pagination: paginationMeta({ total, page, limit }),
      facets: {
        semesters: semesters.filter(Boolean),
        academicYears: academicYears.filter(Boolean),
        lecturerNames: lecturerNames.filter(Boolean).sort((a, b) => a.localeCompare(b, "vi")),
      },
    },
  });
};

function normalizeTargetGrade(v) {
  if (!v) return undefined;
  const s = String(v).toLowerCase();
  if (s === "pass_course") return "pass";
  return s;
}

exports.getRecommendedReviews = async (req, res) => {
  const courseId = req.params.id;
  const query = {
    selfRatedLevel: req.query.selfRatedLevel,
    targetGrade: normalizeTargetGrade(req.query.targetGrade),
    learningStyle: req.query.learningStyle,
    workloadTolerance: req.query.workloadTolerance,
    studyOrientation: req.query.studyOrientation,
  };

  const reviews = await Review.find({
    courseId,
    status: "published",
  }).lean();

  const ranked = rankReviews(reviews, query);
  const lim = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const sliced = ranked.slice(0, lim).map((r) => {
    const { _rankScore, ...rest } = r;
    if (rest.isAnonymous) rest.userId = null;
    return rest;
  });

  return success(res, {
    message: "Recommended reviews",
    data: { items: sliced },
  });
};

exports.attachCourseObjectId = async (req, res, next) => {
  const id = req.params.id;
  try {
    const c = await Course.findById(id).select("_id");
    if (!c) return fail(res, { message: "Course not found", status: 404 });
    req.courseObjectId = c._id;
    next();
  } catch (e) {
    return fail(res, { message: "Invalid course id", status: 400 });
  }
};

function round2(n) {
  if (n == null || Number.isNaN(n)) return null;
  return Math.round(n * 100) / 100;
}

exports.getCourseStats = async (req, res) => {
  const cid = req.courseObjectId;
  const match = { courseId: cid, status: "published" };

  const agg = await Review.aggregate([
    { $match: match },
    {
      $facet: {
        averages: [
          {
            $group: {
              _id: null,
              overall: { $avg: "$ratings.overall" },
              difficulty: { $avg: "$ratings.difficulty" },
              workload: { $avg: "$ratings.workload" },
              usefulness: { $avg: "$ratings.usefulness" },
              gradingFairness: { $avg: "$ratings.gradingFairness" },
              teachingQuality: { $avg: "$ratings.teachingQuality" },
              total: { $sum: 1 },
            },
          },
        ],
        distribution: [
          {
            $group: {
              _id: "$ratings.overall",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        retake: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              wouldTakeAgain: {
                $sum: { $cond: [{ $eq: ["$wouldTakeAgain", true] }, 1, 0] },
              },
            },
          },
        ],
      },
    },
  ]);

  const verifiedCount = await CourseProof.countDocuments({
    courseId: cid,
    status: "approved",
  });

  const course = await Course.findById(cid).lean();
  const commonTags = course?.tags || [];

  const topHelpful = await Review.find(match)
    .sort({ helpfulCount: -1, createdAt: -1 })
    .limit(5)
    .select("ratings helpfulCount createdAt isAnonymous userId details.courseContent")
    .lean();

  const topHelpfulSanitized = topHelpful.map((r) => {
    if (r.isAnonymous) r.userId = null;
    return r;
  });

  const topMaterials = await LearningMaterial.find({ courseId: cid })
    .sort({ helpfulScore: -1, "ratings.usefulness": -1, createdAt: -1 })
    .limit(5)
    .select("title materialType recommendationLevel ratings linkUrl reviewId")
    .lean();

  const av = agg[0]?.averages?.[0] || {};
  const retake = agg[0]?.retake?.[0] || {};
  const retakeRate =
    retake.total > 0 ? Math.round((retake.wouldTakeAgain / retake.total) * 100) : null;
  const totalReviews = av.total || 0;
  const ratingDistribution = (agg[0]?.distribution || []).reduce((acc, d) => {
    acc[String(d._id)] = d.count;
    return acc;
  }, {});

  return success(res, {
    message: "Course statistics",
    data: {
      averageRatings: {
        overall: round2(av.overall),
        difficulty: round2(av.difficulty),
        workload: round2(av.workload),
        usefulness: round2(av.usefulness),
        gradingFairness: round2(av.gradingFairness),
        teachingQuality: round2(av.teachingQuality),
      },
      totalReviews,
      retakeRate,
      totalVerifiedReviews: verifiedCount,
      ratingDistribution,
      commonTags,
      topHelpfulReviews: topHelpfulSanitized,
      topRecommendedMaterials: topMaterials,
    },
  });
};
