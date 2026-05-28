const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");
const ctrl = require("../controllers/upload.controller");

router.post(
  "/",
  authMiddleware,
  upload.array("files", 20),
  asyncHandler(ctrl.uploadFiles)
);

module.exports = router;
