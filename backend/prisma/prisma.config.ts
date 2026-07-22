import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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