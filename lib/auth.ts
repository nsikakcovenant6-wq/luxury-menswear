import bcrypt from "bcryptjs";
import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

const SALT_ROUNDS = 12;

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "JWT_SECRET is not defined in environment variables."
    );
  }

  return secret;
}

export async function hashPassword(
  password: string
): Promise<string> {
  if (!password) {
    throw new Error("Password cannot be empty.");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }

  try {
    return await bcrypt.compare(
      password,
      hashedPassword
    );
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

export function createAuthToken(
  payload: AuthTokenPayload
): string {
  const secret = getJwtSecret();

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, secret, options);
}

export function verifyAuthToken(
  token: string
): AuthTokenPayload | null {
  try {
    if (!token) {
      return null;
    }

    const secret = getJwtSecret();

    const decoded = jwt.verify(
      token,
      secret
    ) as JwtPayload;

    if (
      typeof decoded !== "object" ||
      decoded === null
    ) {
      return null;
    }

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error(
      "JWT verification failed:",
      error
    );

    return null;
  }
}