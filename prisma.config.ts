import "dotenv/config";

export const config = {
  datasourceUrl: process.env.DATABASE_URL,
  binaryTargets: ["native", "debian-openssl-3.0.x"],
};