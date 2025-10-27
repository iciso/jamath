import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL)

async function generateTempPasswords() {
  try {
    // Find all users with placeholder password hash
    const users = await sql`
      SELECT id, email, name FROM users 
      WHERE password_hash = '$2b$10$placeholder'
    `

    if (users.length === 0) {
      console.log("[v0] No users with placeholder passwords found.")
      return
    }

    console.log(`[v0] Found ${users.length} user(s) with placeholder passwords.\n`)

    const tempPasswords = []

    for (const user of users) {
      // Generate a temporary password
      const tempPassword = `Temp${Math.random().toString(36).slice(2, 10).toUpperCase()}123!`
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // Update the user's password hash
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, updated_at = now()
        WHERE id = ${user.id}
      `

      tempPasswords.push({
        email: user.email,
        name: user.name,
        tempPassword,
      })

      console.log(`✓ Updated ${user.email}`)
    }

    console.log("\n=== Temporary Passwords ===\n")
    tempPasswords.forEach((item) => {
      console.log(`Email: ${item.email}`)
      console.log(`Name: ${item.name}`)
      console.log(`Temporary Password: ${item.tempPassword}`)
      console.log("---")
    })

    console.log("\n[v0] Share these temporary passwords with the users.")
    console.log("[v0] They can sign in and change their password in their profile.\n")
  } catch (error) {
    console.error("[v0] Error:", error)
    process.exit(1)
  }
}

generateTempPasswords()
