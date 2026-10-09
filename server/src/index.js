import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";
import aiRoutes from "./routes/ai.js";
import { checkDatabaseHealth } from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Production-ready CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://hire-setu.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow known origins, vercel preview deployments, or development environments
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Static uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Root route (Render service verification)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "running",
    service: "HireSetu Backend",
    environment: process.env.NODE_ENV || "development",
  });
});

// Comprehensive Health check endpoint (Render healthcheck)
app.get("/api/health", async (req, res) => {
  const dbStatus = await checkDatabaseHealth();
  const payload = {
    status: dbStatus.healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: dbStatus.healthy ? "connected" : "disconnected",
  };

  if (!dbStatus.healthy) {
    payload.error = dbStatus.error;
    return res.status(503).json(payload);
  }

  return res.status(200).json(payload);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/ai", aiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`HireSetu server running on port ${PORT} [0.0.0.0]`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forceful shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
