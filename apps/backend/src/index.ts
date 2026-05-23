import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth";
import customerRoutes from "./routes/customers";
import tourRoutes from "./routes/tours";
import bookingRoutes from "./routes/bookings";
import messageRoutes from "./routes/messages";
import zaloRoutes from "./routes/zalo";
import analyticsRoutes from "./routes/analytics";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: env.NODE_ENV, time: new Date().toISOString() });
});
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "ai-tour-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/zalo", zaloRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((_req: Request, _res: Response) => {
  _res.status(404).json({ success: false, error: "Not found" });
});

app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
