const Course = require("../models/Course");

const DUPLICATE_COURSE_CODE_MESSAGE =
  "Mã môn học này đã tồn tại. Vui lòng nhập mã khác.";

function normalizeCourseCode(courseCode) {
  return String(courseCode || "")
    .toUpperCase()
    .trim();
}

async function assertCourseCodeAvailable(courseCode, excludeCourseId = null) {
  const code = normalizeCourseCode(courseCode);
  if (!code) return code;

  const filter = { courseCode: code };
  if (excludeCourseId) {
    filter._id = { $ne: excludeCourseId };
  }

  const exists = await Course.exists(filter);
  if (exists) {
    const err = new Error(DUPLICATE_COURSE_CODE_MESSAGE);
    err.status = 409;
    throw err;
  }

  return code;
}

module.exports = {
  DUPLICATE_COURSE_CODE_MESSAGE,
  normalizeCourseCode,
  assertCourseCodeAvailable,
};
