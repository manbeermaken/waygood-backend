import app from "./app.js";
import { connectDB } from "./config/database.js";
import config from "./config/config.js";

async function startServer() {
  await connectDB();

  app.listen(config.PORT, () => {
    console.log(`Waygood evaluation API running on port ${config.PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
