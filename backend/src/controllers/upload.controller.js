const { success, fail } = require("../utils/response");
const { storeUploadedFiles } = require("../utils/fileUpload");

exports.uploadFiles = async (req, res) => {
  if (!req.files || !req.files.length) {
    return fail(res, { message: "No files uploaded", status: 400 });
  }

  try {
    const files = await storeUploadedFiles(req.files, req);
    return success(res, {
      message: "Files uploaded successfully",
      data: { files },
    });
  } catch (err) {
    console.error("[upload]", err);
    return fail(res, {
      message: err?.message || "Failed to upload files",
      status: 500,
    });
  }
};
