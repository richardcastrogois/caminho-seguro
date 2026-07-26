import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({
  path: ".env.local",
});

const migrationUrl =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_DATABASE_URL_UNPOOLED;

if (!migrationUrl) {
  throw new Error(
    "A variável POSTGRES_URL_NON_POOLING ou POSTGRES_DATABASE_URL_UNPOOLED não foi encontrada.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
