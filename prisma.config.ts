import "dotenv/config";

module.exports = {
  datasourceUrl: process.env.DATABASE_URL,
  binaryTargets: ["native", "debian-openssl-3.0.x"],
};