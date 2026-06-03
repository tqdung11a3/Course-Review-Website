const fs = require("fs");
const path = require("path");
const { cloudinary, isCloudinaryEnabled } = require("../config/cloudinary");
const { ensureUploadDir } = require("../middlewares/upload.middleware");

/** PDF & Office: raw (giữ file gốc). Ảnh: image. */
const RAW_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx"]);

function buildSafeBasename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const base = path.basename(originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
  return { ext, base };
}

function getCloudinaryResourceType(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  return RAW_EXTENSIONS.has(ext) ? "raw" : "image";
}

function uploadToCloudinary(file) {
  const resourceType = getCloudinaryResourceType(file.originalname);
  const { ext, base } = buildSafeBasename(file.originalname);
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const publicId = `${base}-${unique}${ext}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "course-review",
        resource_type: resourceType,
        public_id: publicId,
        filename_override: file.originalname,
        access_mode: "public",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          fileUrl: result.secure_url,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }
    );
    stream.end(file.buffer);
  });
}

function saveToLocalDisk(file, req) {
  const dir = ensureUploadDir();
  const { ext, base } = buildSafeBasename(file.originalname);
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${base}-${unique}${ext}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return {
    fileUrl: `${baseUrl}/uploads/${filename}`,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
  };
}

async function storeUploadedFile(file, req) {
  if (isCloudinaryEnabled()) {
    if (!file.buffer) {
      throw new Error("Missing file buffer for Cloudinary upload");
    }
    return uploadToCloudinary(file);
  }
  if (file.buffer) {
    return saveToLocalDisk(file, req);
  }
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return {
    fileUrl: `${baseUrl}/uploads/${file.filename}`,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
  };
}

async function storeUploadedFiles(files, req) {
  return Promise.all(files.map((f) => storeUploadedFile(f, req)));
}

module.exports = {
  isCloudinaryEnabled,
  storeUploadedFiles,
};
