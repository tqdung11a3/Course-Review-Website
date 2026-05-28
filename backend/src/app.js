const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const errorMiddleware = require("./middlewares/error.middleware");
const { ensureUploadDir } = require("./middlewares/upload.middleware");

ensureUploadDir();

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const courseProofRoutes = require("./routes/courseProof.routes");
const reviewRoutes = require("./routes/review.routes");
const learningMaterialRoutes = require("./routes/learningMaterial.routes");
const reportRoutes = require("./routes/report.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

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

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

module.exports = app;
