import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "dairy-farm-secret-change-in-production";
const DEFAULT_EXPIRY = "7d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  farmId?: string;
  iat?: number;
  exp?: number;
}

export function getJwtSecret(): string {
  return JWT_SECRET;
}

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const { sign } = await import("jsonwebtoken");
  return new Promise((resolve, reject) => {
    sign(
      payload,
      JWT_SECRET,
      { expiresIn: DEFAULT_EXPIRY },
      (err, token) => (err ? reject(err) : resolve(token ?? ""))
    );
  });
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  const { verify } = await import("jsonwebtoken");
  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.cookies.get("token")?.value ?? null;
}

export async function getPayloadFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
