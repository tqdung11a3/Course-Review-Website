const { success, fail } = require("../utils/response");

exports.uploadFiles = async (req, res) => {
  if (!req.files || !req.files.length) {
    return fail(res, { message: "No files uploaded", status: 400 });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const prefix = `/uploads`;

  const data = req.files.map((f) => ({
    fileUrl: `${baseUrl}${prefix}/${f.filename}`,
    fileName: f.originalname,
    fileType: f.mimetype,
    fileSize: f.size,
  }));

  return success(res, {
    message: "Files uploaded successfully",
    data: { files: data },
  });
};
