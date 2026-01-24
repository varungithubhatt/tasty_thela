import rateLimit from "express-rate-limit";

// 🔐 Login limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: "Too many login attempts. Try again after 15 minutes."
  }
});

// 📝 Register limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    message: "Too many accounts created. Try later."
  }
});

// ⭐ Review limiter
export const reviewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    message: "Too many reviews. Please slow down."
  }
});

// 🔍 Search limiter
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: {
    message: "Too many search requests. Please slow down."
  }
});
