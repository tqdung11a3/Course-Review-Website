const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { authMiddleware } = require("../middlewares/auth.middleware");
const notification = require("../controllers/notification.controller");

router.get("/", authMiddleware, asyncHandler(notification.listMyNotifications));
router.put("/read-all", authMiddleware, asyncHandler(notification.markAllAsRead));
router.put("/:id/read", authMiddleware, asyncHandler(notification.markAsRead));

module.exports = router;
