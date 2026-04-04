import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/http';

const formatZodIssue = (error: z.ZodError) => {
  const issue = error.issues[0];
  const field = issue?.path?.[0] ?? 'field';
  return `${field}: ${issue.message}`;
};

export const validateBody =
  (schema: z.Schema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, formatZodIssue(error)));
        return;
      }

      next(new AppError(500, 'Internal server error'));
    }
  };

export const validateQuery =
  (schema: z.Schema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, formatZodIssue(error)));
        return;
      }

      next(new AppError(500, 'Internal server error'));
    }
  };

export const validateParams =
  (schema: z.Schema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, formatZodIssue(error)));
        return;
      }

      next(new AppError(500, 'Internal server error'));
    }
  };
