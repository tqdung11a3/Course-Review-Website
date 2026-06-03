const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");
const { isCloudinaryEnabled } = require("../config/cloudinary");

const ALLOWED_EXT = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
]);

const MAX_SIZE = 10 * 1024 * 1024;

function ensureUploadDir() {
  const dir = path.isAbsolute(env.UPLOAD_DIR)
    ? env.UPLOAD_DIR
    : path.join(process.cwd(), env.UPLOAD_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const storage = isCloudinaryEnabled()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, ensureUploadDir());
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${base}-${unique}${ext}`);
      },
    });

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return cb(new Error(`File type not allowed: ${ext}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 20 },
  fileFilter,
});

module.exports = {
  upload,
  ensureUploadDir,
  MAX_FILE_SIZE: MAX_SIZE,
};
