require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/course-review",
  JWT_SECRET: process.env.JWT_SECRET || "change_me_in_production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
};

if (!process.env.JWT_SECRET && env.NODE_ENV === "production") {
  console.warn("[env] JWT_SECRET is not set; using insecure default.");
}

module.exports = env;
