import mongoose from "mongoose";

import config from "./config.js";

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB");
}

async function disconnectDB() {
  await mongoose.connection.close();
}

export { connectDB, disconnectDB };
