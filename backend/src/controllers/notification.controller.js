const Notification = require("../models/Notification");
const { parsePagination, paginationMeta } = require("../utils/pagination");
const { success, fail } = require("../utils/response");

exports.listMyNotifications = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { userId: req.user._id };

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);

  return success(res, {
    message: "Notifications",
    data: {
      items,
      unreadCount,
      pagination: paginationMeta({ total, page, limit }),
    },
  });
};

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!notification) return fail(res, { message: "Notification not found", status: 404 });
  return success(res, { message: "Marked as read", data: { notification } });
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
  return success(res, { message: "All marked as read", data: {} });
};
