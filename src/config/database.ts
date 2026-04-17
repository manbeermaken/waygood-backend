import mongoose from "mongoose";

import config from "./config.js";

async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB");
}

export default connectDatabase;
