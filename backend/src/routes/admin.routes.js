const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const admin = require("../controllers/admin.controller");

router.use(authMiddleware, roleMiddleware("admin", "moderator"));

router.get("/stats", asyncHandler(admin.getModerationStats));
router.get("/reviews/pending", asyncHandler(admin.listPendingReviews));
router.get("/reviews/:id", asyncHandler(admin.getReviewForModeration));

module.exports = router;
