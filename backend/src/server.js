const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");
const { isCloudinaryEnabled } = require("./config/cloudinary");
const { verifyConnection } = require("./utils/mailer");

async function start() {
  try {
    await connectDb();
    console.log("MongoDB connected");
    console.log(
      isCloudinaryEnabled()
        ? "File storage: Cloudinary"
        : "File storage: local disk (set CLOUDINARY_* for cloud uploads)"
    );

    try {
      await verifyConnection();
    } catch (mailErr) {
      console.error("[mailer] ❌ Lỗi kết nối SMTP:", mailErr.message);
    }

    app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
