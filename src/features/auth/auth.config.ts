import type { SignOptions } from "jsonwebtoken";

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET ?? "caminho-seguro-dev-secret-nao-uso-em-producao",
  signOptions: { expiresIn: 86400 } satisfies SignOptions,
};
