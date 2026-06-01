const router = require("express").Router();
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middlewares/validate.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const course = require("../controllers/course.controller");
const learningMaterial = require("../controllers/learningMaterial.controller");
const { optionalAuthMiddleware } = require("../middlewares/auth.middleware");

router.get("/", asyncHandler(course.listCourses));

router.post(
  "/",
  authMiddleware,
  [
    body("courseCode").trim().notEmpty(),
    body("courseName").trim().notEmpty(),
    body("credits").isNumeric().withMessage("credits is required and must be numeric"),
    body("faculty").trim().notEmpty().withMessage("faculty is required"),
    body("tags").optional().isArray(),
    body("courseType").optional().isString(),
    body("offeredSemesters").optional().isArray(),
    body("teachingLanguage").optional().isString(),
    body("learningMode").optional().isString(),
    body("assessmentMethods").optional().isArray(),
    body("prerequisiteCourseIds").optional().isArray(),
    body("syllabusFiles").optional().isArray(),
  ],
  validateRequest,
  asyncHandler(course.createCourse)
);

router.get("/:id/stats", asyncHandler(course.attachCourseObjectId), asyncHandler(course.getCourseStats));
router.get("/:id/reviews/recommended", asyncHandler(course.getRecommendedReviews));
router.get("/:id/reviews", optionalAuthMiddleware, asyncHandler(course.listCourseReviews));
router.get("/:id/materials", asyncHandler(learningMaterial.listMaterialsByCourse));

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "moderator"),
  [
    body("courseCode").optional().trim().notEmpty(),
    body("courseName").optional().trim().notEmpty(),
    body("credits").optional().isNumeric(),
    body("faculty").optional().isString(),
    body("tags").optional().isArray(),
    body("courseType").optional().isString(),
    body("offeredSemesters").optional().isArray(),
    body("teachingLanguage").optional().isString(),
    body("learningMode").optional().isString(),
    body("assessmentMethods").optional().isArray(),
    body("prerequisiteCourseIds").optional().isArray(),
    body("syllabusFiles").optional().isArray(),
  ],
  validateRequest,
  asyncHandler(course.updateCourse)
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "moderator"),
  asyncHandler(course.deleteCourse)
);

router.get("/:id", asyncHandler(course.getCourse));

module.exports = router;
