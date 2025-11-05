// lib/neon.ts
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL

let sql;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is missing — using safe mock")
  // Return a function that throws only when called
  sql = ((query: TemplateStringsArray, ...values: any[]) => {
    throw new Error("Database not available — DATABASE_URL missing")
  }) as any
} else {
  sql = neon(DATABASE_URL)
}

export { sql }
