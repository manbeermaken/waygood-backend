import cors from "cors";
import express, { json } from "express";
import morgan from "morgan";

import applicationRoutes from "./routes/applicationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

const app = express();

app.use(cors());
app.use(json());
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
