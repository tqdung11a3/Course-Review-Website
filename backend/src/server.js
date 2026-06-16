const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");
const { isCloudinaryEnabled } = require("./config/cloudinary");

async function start() {
  try {
    await connectDb();
    console.log("MongoDB connected");
    console.log(
      isCloudinaryEnabled()
        ? "File storage: Cloudinary"
        : "File storage: local disk (set CLOUDINARY_* for cloud uploads)"
    );

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
