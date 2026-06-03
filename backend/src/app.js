const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const errorMiddleware = require("./middlewares/error.middleware");
const { ensureUploadDir } = require("./middlewares/upload.middleware");

const uploadDir = ensureUploadDir();

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const courseProofRoutes = require("./routes/courseProof.routes");
const reviewRoutes = require("./routes/review.routes");
const learningMaterialRoutes = require("./routes/learningMaterial.routes");
const reportRoutes = require("./routes/report.routes");
const uploadRoutes = require("./routes/upload.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const app = express();

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadDir));

app.use("/uploads", (req, res) => {
  res.status(404).json({
    success: false,
    message:
      "File not found. On Render free tier, uploaded files may be removed after redeploy or restart. Please re-upload the document.",
  });
});

app.get("/health", (req, res) => {
  res.json({ success: true, message: "OK", data: { uptime: process.uptime() } });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/course-proofs", courseProofRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/materials", learningMaterialRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

module.exports = app;
