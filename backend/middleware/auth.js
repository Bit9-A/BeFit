const supabase = require("../services/supabaseClient");

/**
 * Middleware to verify Supabase JWT token
 * Adds user info to req.user if valid
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
        requestId: req.requestId,
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
        requestId: req.requestId,
      });
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || "authenticated",
    };

    next();
  } catch (error) {
    console.error("[Auth] Error verifying token:", error);
    return res.status(500).json({
      error: "Authentication Error",
      message: "Failed to verify authentication",
      requestId: req.requestId,
    });
  }
};

/**
 * Optional authentication - doesn't require auth but adds user if present
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role || "authenticated",
        };
      }
    }

    next();
  } catch (error) {
    // Continue without auth on error
    next();
  }
};

/**
 * Rate limit check for specific user
 */
const userRateLimit = (maxRequests = 50, windowMinutes = 15) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    // Get or create user's request history
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    // Remove old requests outside window
    const validRequests = userRequests.filter((time) => now - time < windowMs);
    requests.set(userId, validRequests);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: "Rate Limit Exceeded",
        message: `Maximum ${maxRequests} requests per ${windowMinutes} minutes`,
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000),
        requestId: req.requestId,
      });
    }

    validRequests.push(now);
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  userRateLimit,
};
