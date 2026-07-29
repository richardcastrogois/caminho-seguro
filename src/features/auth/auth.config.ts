import type { SignOptions } from "jsonwebtoken";

const configuredJwtSecret = process.env.JWT_SECRET;

const isVercelProduction = process.env.VERCEL_ENV === "production";

if (isVercelProduction && !configuredJwtSecret) {
  throw new Error("JWT_SECRET precisa estar configurado no ambiente de produção.");
}

export const authConfig = {
  jwtSecret:
    configuredJwtSecret ?? "caminho-seguro-segredo-exclusivo-para-desenvolvimento-local",
  signOptions: {
    expiresIn: 86400,
  } satisfies SignOptions,
};
