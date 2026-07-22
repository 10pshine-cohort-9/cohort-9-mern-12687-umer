import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import logger from "./services/logger.js";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/document.js";
import { errorHandler } from "./middleware/errorHandler.js";
import rateLimit from "express-rate-limit";

const app: Express = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/documents", documentRoutes);

app.get("/health", (req: Request, res: Response) => {
  logger.info("Okay");
  res.send("Okay");
});
app.use(errorHandler);

export default app;
