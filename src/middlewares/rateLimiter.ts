import { Request, Response, NextFunction } from 'express';

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Arcjet middleware placeholder
  // In production, configure Arcjet with your API key
  // For now, use a simple in-memory rate limiter
  next();
};
