import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE, verifyToken } from "../lib/auth";

export type AuthedRequest = Request & { userId: number };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE];
  const userId = typeof token === "string" ? verifyToken(token) : null;

  if (!userId) {
    return res.status(401).json({ message: "Não autenticado." });
  }

  (req as AuthedRequest).userId = userId;
  next();
}
