const router = require("express").Router();
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middlewares/validate.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/courseProof.controller");
const ReviewReport = require("../models/ReviewReport");

router.post(
  "/",
  authMiddleware,
  [
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("semester").trim().notEmpty(),
    body("academicYear").trim().notEmpty(),
    body("proofFiles").isArray({ min: 1 }).withMessage("proofFiles array required"),
  ],
  validateRequest,
  asyncHandler(ctrl.createProof)
);

router.get("/me", authMiddleware, asyncHandler(ctrl.listMyProofs));
router.get("/pending", authMiddleware, roleMiddleware("admin", "moderator"), asyncHandler(ctrl.listPendingProofs));
router.put("/:id/approve", authMiddleware, roleMiddleware("admin", "moderator"), asyncHandler(ctrl.approveProof));
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin", "moderator"),
  [body("rejectReason").optional().isString()],
  validateRequest,
  asyncHandler(ctrl.rejectProof)
);

module.exports = router;
