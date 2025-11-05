// lib/db.ts
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment")
}

const sql = neon(DATABASE_URL)
export { sql }
