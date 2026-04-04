import { NextFunction, Request, RequestHandler, Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  data: unknown;

  constructor(statusCode: number, message: string, data: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const parseNumericId = (value: string, resourceName: string) => {
  const id = Number(value);

  if (Number.isNaN(id)) {
    throw new AppError(400, `Invalid ${resourceName} id`);
  }

  return id;
};

export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
