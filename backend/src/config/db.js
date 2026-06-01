const mongoose = require("mongoose");
const env = require("./env");
const User = require("../models/User");

async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  await User.syncIndexes();
  return mongoose.connection;
}

module.exports = { connectDb };
