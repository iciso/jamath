// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const authOptions = {
  providers: [
    Google({
      clientId: "215508504819-l9sgava2j04ie992cpqie3mmpt93kugb.apps.googleusercontent.com",
      clientSecret: "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",
    }),
  ],
  pages: { signIn: "/signin" },
  secret: "x+sA09wQtrPyd74LaFAWx1NstToyCgamncOUb2vkLrI=",
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
