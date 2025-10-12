import { neon } from "@neondatabase/serverless"

declare global {
  // eslint-disable-next-line no-var
  var __neonSql__: ReturnType<typeof neon> | undefined
}

export const sql = global.__neonSql__ ?? neon(process.env.DATABASE_URL as string)

if (!global.__neonSql__) {
  global.__neonSql__ = sql
}
