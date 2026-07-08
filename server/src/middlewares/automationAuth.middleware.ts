import type { NextFunction, Request, Response } from "express";
import { extractApiKey, isAutomationApiKey } from "../utils/apiKeyAuth.js";

export function automationAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const apiKey = extractApiKey(req);
  if (!isAutomationApiKey(apiKey)) {
    res.status(401).json({ message: "유효하지 않은 API Key입니다." });
    return;
  }
  next();
}
