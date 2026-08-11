import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "luxury-menswear-secret";

export type LegacyTokenPayload = {
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
};

export function signToken(
  payload: object
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(
  token: string
): LegacyTokenPayload | null {
  try {
    return jwt.verify(
      token,
      JWT_SECRET
    ) as LegacyTokenPayload;
  } catch {
    return null;
  }
}