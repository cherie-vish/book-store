import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "./db"
import { users } from "./db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const email = credentials.email as string
        const password = credentials.password as string
        
        const user = await db.select().from(users).where(eq(users.email, email))
        
        if (!user[0]) return null
        
        const isValid = await bcrypt.compare(password, user[0].password)
        if (!isValid) return null
        
        return { id: String(user[0].id), name: user[0].name, email: user[0].email, role: user[0].role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
})