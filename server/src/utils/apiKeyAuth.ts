import type { Request } from "express";
import { env } from "../config/env.js";

export const AUTOMATION_ADMIN_USER = {
  id: "automation-service",
  username: "automation",
  role: "ADMIN" as const,
};

export function extractApiKey(req: Request): string | undefined {
  const headerKey = req.headers["x-api-key"];
  if (typeof headerKey === "string" && headerKey.trim()) {
    return headerKey.trim();
  }

  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();
    if (token && token === env.AUTOMATION_API_KEY) {
      return token;
    }
  }

  return undefined;
}

export function isAutomationApiKey(key: string | undefined): boolean {
  return Boolean(key && key === env.AUTOMATION_API_KEY);
}
