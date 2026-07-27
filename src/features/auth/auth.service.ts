import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const SALT_ROUNDS = 12;

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return null;
    }

    if (user.status !== "ACTIVE") {
      return null;
    }

    const valid = await this.verifyPassword(password, user.passwordHash);

    if (!valid) {
      return null;
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, authConfig.jwtSecret, authConfig.signOptions);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  verifyToken(token: string): JwtPayload | null {
    try {
      const payload = jwt.verify(token, authConfig.jwtSecret) as JwtPayload;
      return payload;
    } catch {
      return null;
    }
  },
};
