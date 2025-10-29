import "dotenv/config";
import { defineConfig } from "@prisma/client/runtime";

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
  binaryTargets: ["native", "debian-openssl-3.0.x"],
});