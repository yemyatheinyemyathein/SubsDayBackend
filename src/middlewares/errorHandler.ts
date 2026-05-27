import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.code === 11000) {
    res.status(400).json({ error: 'Email already exists' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
};
