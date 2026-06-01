const router = require("express").Router();
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middlewares/validate.middleware");
const { authMiddleware, optionalAuthMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const review = require("../controllers/review.controller");
const learningMaterial = require("../controllers/learningMaterial.controller");
const vote = require("../controllers/vote.controller");
const report = require("../controllers/report.controller");
const ReviewReport = require("../models/ReviewReport");

const ratingsValidator = [
  body("ratings.overall").isInt({ min: 1, max: 5 }),
  body("ratings.difficulty").isInt({ min: 1, max: 5 }),
  body("ratings.workload").isInt({ min: 1, max: 5 }),
  body("ratings.usefulness").isInt({ min: 1, max: 5 }),
  body("ratings.gradingFairness").isInt({ min: 1, max: 5 }),
  body("ratings.teachingQuality").isInt({ min: 1, max: 5 }),
];

router.post(
  "/",
  authMiddleware,
  [
    body("courseId").notEmpty(),
    body("enrollmentProofId").notEmpty(),
    body("semester").trim().notEmpty(),
    body("academicYear").trim().notEmpty(),
    ...ratingsValidator,
  ],
  validateRequest,
  asyncHandler(review.createReview)
);

router.get("/me", authMiddleware, asyncHandler(review.listMyReviews));
router.get("/", optionalAuthMiddleware, asyncHandler(review.listReviews));

router.put(
  "/:id/publish",
  authMiddleware,
  roleMiddleware("admin", "moderator"),
  asyncHandler(review.publishReview)
);
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin", "moderator"),
  asyncHandler(review.rejectReview)
);
router.put(
  "/:id/hide",
  authMiddleware,
  roleMiddleware("admin", "moderator"),
  asyncHandler(review.hideReview)
);

router.post(
  "/:id/vote",
  authMiddleware,
  [body("voteType").isIn(["helpful", "not_helpful"])],
  validateRequest,
  asyncHandler(vote.upsertVote)
);
router.delete("/:id/vote", authMiddleware, asyncHandler(vote.removeVote));

router.post(
  "/:id/report",
  authMiddleware,
  [body("reason").isIn(ReviewReport.REPORT_REASONS)],
  validateRequest,
  asyncHandler(report.createReport)
);

router.post(
  "/:reviewId/materials",
  authMiddleware,
  [
    body("title").trim().notEmpty(),
    body("materialType").notEmpty(),
  ],
  validateRequest,
  asyncHandler(learningMaterial.createMaterial)
);

router.put("/:id", authMiddleware, asyncHandler(review.updateReview));
router.delete("/:id", authMiddleware, asyncHandler(review.deleteReview));
router.get("/:id", optionalAuthMiddleware, asyncHandler(review.getReview));

module.exports = router;
