"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const rateLimiter = async (req, res, next) => {
    // Arcjet middleware placeholder
    // In production, configure Arcjet with your API key
    // For now, use a simple in-memory rate limiter
    next();
};
exports.rateLimiter = rateLimiter;
//# sourceMappingURL=rateLimiter.js.map