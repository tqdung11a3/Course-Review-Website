const { body } = require("express-validator");
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { validateRequest } = require("../middlewares/validate.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");
const auth = require("../controllers/auth.controller");

const SCHOOL_EMAIL_SUFFIX = "@sis.hust.edu.vn";

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("fullName is required"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .custom((value) => {
        if (
          !String(value || "")
            .trim()
            .toLowerCase()
            .endsWith(SCHOOL_EMAIL_SUFFIX)
        ) {
          throw new Error("Only school emails (@sis.hust.edu.vn) are accepted");
        }
        return true;
      }),
    body("role")
      .notEmpty()
      .withMessage("role is required")
      .isIn(["student", "admin", "moderator"])
      .withMessage("role must be student, admin, or moderator"),
    body("studentId").custom((value, { req }) => {
      const role = String(req.body.role || "")
        .trim()
        .toLowerCase();
      if (role === "student" && !String(value || "").trim()) {
        throw new Error("studentId is required for students");
      }
      return true;
    }),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("confirmPassword is required")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("confirmPassword does not match password"),
  ],
  validateRequest,
  asyncHandler(auth.register)
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
    body("role")
      .notEmpty()
      .withMessage("role is required")
      .isIn(["student", "admin", "moderator"])
      .withMessage("role must be student, admin, or moderator"),
  ],
  validateRequest,
  asyncHandler(auth.login)
);

router.post("/logout", authMiddleware, asyncHandler(auth.logout));
router.get("/me", authMiddleware, asyncHandler(auth.me));
router.put("/profile", authMiddleware, asyncHandler(auth.updateProfile));

module.exports = router;
