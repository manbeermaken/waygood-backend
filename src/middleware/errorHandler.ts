import HttpError from "../utils/httpError.js";
import type { Request, Response, NextFunction } from "express";

function errorHandler(
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong.",
    details: error.details || undefined,
  });
}

export default errorHandler;
