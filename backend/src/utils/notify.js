const Notification = require("../models/Notification");

async function createNotification({ userId, type, title, message, reviewId, courseId }) {
  return Notification.create({
    userId,
    type,
    title,
    message: message || "",
    reviewId: reviewId || null,
    courseId: courseId || null,
  });
}

module.exports = { createNotification };
