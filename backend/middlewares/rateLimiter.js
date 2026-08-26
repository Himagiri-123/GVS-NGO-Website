// Simple in-memory rate limiter for public form endpoints (contact, volunteer,
// applications) to reduce spam/bot abuse. No external package needed.
// Note: this resets if the server restarts, and only limits per-server-instance
// (fine for a single Render instance; won't scale across multiple instances).

const requestLog = new Map(); // ip -> [timestamps]

const formSubmitLimiter = (maxRequests = 5, windowMinutes = 15) => {
  const windowMs = windowMinutes * 60 * 1000;

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    const now = Date.now();

    const timestamps = (requestLog.get(ip) || []).filter(t => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    timestamps.push(now);
    requestLog.set(ip, timestamps);
    next();
  };
};

module.exports = formSubmitLimiter;
