const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");

async function start() {
  try {
    await connectDb();
    console.log("MongoDB connected");
    app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
