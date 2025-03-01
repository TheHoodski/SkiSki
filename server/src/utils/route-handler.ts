// server/src/utils/route-handler.ts

import { Request, Response } from 'express';

// Generic route handler utility
export function createHandler<
  Params = {},                // URL parameters
  ResBody = any,              // Response body
  ReqBody = any,              // Request body
  Query = {}                  // Query parameters
>(
  handler: (
    req: Request<Params, ResBody, ReqBody, Query>,
    res: Response<ResBody>
  ) => Promise<void> | void
) {
  return handler;
}