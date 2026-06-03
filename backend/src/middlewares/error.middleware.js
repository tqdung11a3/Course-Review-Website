function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({
      success: false,
      message: first ? first.message : "Validation error",
    });
  }

  if (err.code === 11000) {
    const dupField = err.keyPattern ? Object.keys(err.keyPattern)[0] : "";
    if (dupField === "courseCode") {
      return res.status(409).json({
        success: false,
        message: "Mã môn học này đã tồn tại. Vui lòng nhập mã khác.",
      });
    }
    return res.status(409).json({
      success: false,
      message: "Duplicate entry — this record already exists",
    });
  }

  if (err.status === 409 && err.message) {
    return res.status(409).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message && err.message.includes("File type not allowed")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({ success: false, message });
}

module.exports = errorMiddleware;
