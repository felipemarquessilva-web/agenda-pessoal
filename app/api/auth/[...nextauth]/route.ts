import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Lista de e-mails permitidos separada por vírgula no arquivo .env
const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Se a variável ALLOWED_EMAILS estiver vazia, por segurança bloqueia todo mundo
      if (allowedEmails.length === 0) return false;
      
      // Permitir apenas se o e-mail do usuário estiver na lista
      if (user.email && allowedEmails.includes(user.email)) {
        return true;
      }
      return false; // Bloqueia outros e-mails
    },
    async session({ session, user }) {
      if (session.user) {
        // Estender a session com o ID do banco de dados
        (session.user as any).id = user.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Página customizada que criaremos depois
  },
  session: {
    strategy: "database",
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
