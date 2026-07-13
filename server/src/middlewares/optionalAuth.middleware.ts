import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import type { AuthRequest } from "./auth.middleware.js";

/** Bearer 토큰이 있으면 유저를 채우고, 없어도 통과한다. */
export function optionalAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
