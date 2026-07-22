import path from "path";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Force dotenv to step up into the project root directory
config({ path: path.resolve(__dirname, "../.env") });

export default defineConfig({
  schema: "schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
