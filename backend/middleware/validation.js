/**
 * Request validation middleware
 * Validates incoming request data against schema
 */

// Simple validation helpers
const validators = {
  isString: (val) => typeof val === "string",
  isNumber: (val) => typeof val === "number" && !isNaN(val),
  isPositiveNumber: (val) => typeof val === "number" && val > 0,
  isEmail: (val) =>
    typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  isUUID: (val) =>
    typeof val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
  isDate: (val) => !isNaN(Date.parse(val)),
  isArray: (val) => Array.isArray(val),
  isObject: (val) =>
    typeof val === "object" && val !== null && !Array.isArray(val),
  isIn: (val, options) => options.includes(val),
  minLength: (val, min) => typeof val === "string" && val.length >= min,
  maxLength: (val, max) => typeof val === "string" && val.length <= max,
  min: (val, minVal) => typeof val === "number" && val >= minVal,
  max: (val, maxVal) => typeof val === "number" && val <= maxVal,
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .trim()
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, ""); // Remove remaining brackets
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return typeof obj === "string" ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value);
  }
  return sanitized;
};

/**
 * Validate metrics request
 */
const validateMetricsRequest = (req, res, next) => {
  const { weight, height, age, gender, activityLevel } = req.body;
  const errors = [];

  if (!weight || !validators.isPositiveNumber(weight)) {
    errors.push("weight must be a positive number");
  }
  if (weight && (weight < 20 || weight > 500)) {
    errors.push("weight must be between 20 and 500 kg");
  }

  if (!height || !validators.isPositiveNumber(height)) {
    errors.push("height must be a positive number");
  }
  if (height && (height < 50 || height > 300)) {
    errors.push("height must be between 50 and 300 cm");
  }

  if (!age || !validators.isPositiveNumber(age)) {
    errors.push("age must be a positive number");
  }
  if (age && (age < 10 || age > 120)) {
    errors.push("age must be between 10 and 120 years");
  }

  if (!gender || !validators.isIn(gender, ["male", "female", "other"])) {
    errors.push("gender must be 'male', 'female', or 'other'");
  }

  if (
    !activityLevel ||
    !validators.isIn(activityLevel, [
      "sedentary",
      "light",
      "moderate",
      "active",
      "very_active",
    ])
  ) {
    errors.push(
      "activityLevel must be one of: sedentary, light, moderate, active, very_active",
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid request data",
      details: errors,
      requestId: req.requestId,
    });
  }

  // Sanitize body
  req.body = sanitizeObject(req.body);
  next();
};

/**
 * Validate routine generation request
 */
const validateRoutineRequest = (req, res, next) => {
  const { userProfile, goal } = req.body;
  const errors = [];

  if (!userProfile || !validators.isObject(userProfile)) {
    errors.push("userProfile must be an object");
  }

  if (!goal || !validators.isString(goal)) {
    errors.push("goal must be a string");
  }
  if (
    goal &&
    !validators.isIn(goal, ["muscle_gain", "weight_loss", "maintenance"])
  ) {
    errors.push("goal must be one of: muscle_gain, weight_loss, maintenance");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid request data",
      details: errors,
      requestId: req.requestId,
    });
  }

  req.body = sanitizeObject(req.body);
  next();
};

/**
 * Validate chat request
 */
const validateChatRequest = (req, res, next) => {
  const { message, history } = req.body;
  const errors = [];

  if (!message || !validators.isString(message)) {
    errors.push("message must be a string");
  }
  if (message && !validators.minLength(message, 1)) {
    errors.push("message cannot be empty");
  }
  if (message && !validators.maxLength(message, 2000)) {
    errors.push("message must be less than 2000 characters");
  }

  if (history && !validators.isArray(history)) {
    errors.push("history must be an array");
  }
  if (history && history.length > 50) {
    errors.push("history cannot exceed 50 messages");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid request data",
      details: errors,
      requestId: req.requestId,
    });
  }

  req.body = sanitizeObject(req.body);
  next();
};

/**
 * Validate image upload
 */
const validateImageUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Image file is required",
      requestId: req.requestId,
    });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: "Validation Error",
      message: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
      requestId: req.requestId,
    });
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: "Validation Error",
      message: "File size must be less than 10MB",
      requestId: req.requestId,
    });
  }

  next();
};

module.exports = {
  validators,
  sanitizeString,
  sanitizeObject,
  validateMetricsRequest,
  validateRoutineRequest,
  validateChatRequest,
  validateImageUpload,
};
