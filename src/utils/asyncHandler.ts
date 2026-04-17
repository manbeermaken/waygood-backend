import type { Request, Response, NextFunction } from 'express'

type AsyncHandlerFunction = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => Promise<any>;

export default function asyncHandler(handler: AsyncHandlerFunction) {
  return async function wrappedHandler(req: Request, res: Response, next: NextFunction) {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

