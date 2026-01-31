require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// SECURITY MIDDLEWARE
// ======================

// Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting - prevent abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: "Too many requests, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: {
    error:
      "AI rate limit exceeded. Please wait before making more AI requests.",
    retryAfter: "1 minute",
  },
});

app.use(generalLimiter);

// Request logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Body parsing with limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ======================
// REQUEST UTILITIES
// ======================

// Add request ID for tracing
app.use((req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.requestId);
  next();
});

// Request timestamp
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ======================
// ROUTES
// ======================

const apiRoutes = require("./routes/apiRoutes");

// Apply AI rate limiter to specific routes
app.use("/api/generate-routine", aiLimiter);
app.use("/api/chat", aiLimiter);
app.use("/api/analyze-fridge", aiLimiter);
app.use("/api/daily-feed", aiLimiter);

// API routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    service: "BeFit API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

// ======================
// ERROR HANDLING
// ======================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.requestId,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${req.requestId}] Error:`, err);

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: isDev ? err.message : "An unexpected error occurred",
    requestId: req.requestId,
    ...(isDev && { stack: err.stack }),
  });
});

// ======================
// GRACEFUL SHUTDOWN
// ======================

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════╗
║         BE FIT API SERVER                  ║
╠════════════════════════════════════════════╣
║  Status:  Running                          ║
║  Port:    ${PORT}                              ║
║  Mode:    ${process.env.NODE_ENV || "development"}                     ║
║  Time:    ${new Date().toISOString()}    ║
╚════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed. Exiting process.");
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error(
      "Could not close connections in time. Forcefully shutting down.",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;
