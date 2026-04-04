import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/http';

export const errorMiddleware = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, message: 'Validation error', data: error.errors });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message, data: error.data });
  }

  return res.status(500).json({ success: false, message: 'Internal server error', data: null });
};
