const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { authMiddleware } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/learningMaterial.controller");

router.get("/:id", asyncHandler(ctrl.getMaterial));
router.put("/:id", authMiddleware, asyncHandler(ctrl.updateMaterial));
router.delete("/:id", authMiddleware, asyncHandler(ctrl.deleteMaterial));

module.exports = router;
