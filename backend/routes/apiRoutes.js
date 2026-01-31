const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for secure file uploads
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Secure filename with timestamp and random string
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WebP, and HEIC are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1,
  },
});

// Controllers
const kitchenController = require("../controllers/kitchenController");
const userController = require("../controllers/userController");
const gymController = require("../controllers/gymController");
const chatController = require("../controllers/chatController");
const wellnessController = require("../controllers/wellnessController");

// Middleware
const { optionalAuth } = require("../middleware/auth");
const {
  validateMetricsRequest,
  validateRoutineRequest,
  validateChatRequest,
  validateImageUpload,
} = require("../middleware/validation");

// Error wrapper for async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// =====================
// KITCHEN ROUTES
// =====================
router.post(
  "/analyze-fridge",
  optionalAuth,
  upload.single("image"),
  validateImageUpload,
  asyncHandler(kitchenController.analyzeFridge),
);

// =====================
// USER ROUTES
// =====================
router.post(
  "/calculate-metrics",
  optionalAuth,
  validateMetricsRequest,
  asyncHandler(userController.calculateMetrics),
);

// =====================
// GYM ROUTES
// =====================
router.post(
  "/generate-routine",
  optionalAuth,
  validateRoutineRequest,
  asyncHandler(gymController.generateRoutine),
);

// =====================
// CHAT ROUTES
// =====================
router.post(
  "/chat",
  optionalAuth,
  validateChatRequest,
  asyncHandler(chatController.chat),
);

// =====================
// WELLNESS ROUTES
// =====================
router.post(
  "/daily-feed",
  optionalAuth,
  asyncHandler(wellnessController.getDailyFeed),
);

// =====================
// ACTIVITY LOGGING
// =====================
router.post(
  "/log-activity",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { action, resourceType, resourceId, metadata } = req.body;
    const supabase = require("../services/supabaseClient");

    if (req.user?.id) {
      await supabase.from("activity_log").insert({
        user_id: req.user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata,
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    }

    res.json({ success: true });
  }),
);

// =====================
// MULTER ERROR HANDLER
// =====================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File Too Large",
        message: "File size must be less than 10MB",
        requestId: req.requestId,
      });
    }
    return res.status(400).json({
      error: "Upload Error",
      message: err.message,
      requestId: req.requestId,
    });
  }
  next(err);
});

module.exports = router;
