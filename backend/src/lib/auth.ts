import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";

export const AUTH_COOKIE = "gameshelf_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não definido no .env");
  return secret;
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function signToken(userId: number): string {
  return jwt.sign({}, getSecret(), { subject: String(userId), expiresIn: "7d" });
}

export function verifyToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, getSecret());
    if (typeof payload === "string" || !payload.sub) return null;
    const id = Number(payload.sub);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, { ...cookieOptions, maxAge: SEVEN_DAYS_MS });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
}
