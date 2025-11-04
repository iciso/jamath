// lib/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Use your actual Neon connection string
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Export raw sql for tagged templates
export { sql };
