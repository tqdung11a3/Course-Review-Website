const router = require("express").Router();
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middlewares/validate.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const report = require("../controllers/report.controller");
const ReviewReport = require("../models/ReviewReport");

router.get("/", authMiddleware, roleMiddleware("admin", "moderator"), asyncHandler(report.listReports));
router.put(
  "/:id/resolve",
  authMiddleware,
  roleMiddleware("admin", "moderator"),
  [
    body("status").optional().isIn(ReviewReport.REPORT_STATUSES),
    body("action").optional().isIn(["hide_review", "dismiss", "none"]),
    body("resolutionNote").optional().isString(),
  ],
  validateRequest,
  asyncHandler(report.resolveReport)
);

module.exports = router;
