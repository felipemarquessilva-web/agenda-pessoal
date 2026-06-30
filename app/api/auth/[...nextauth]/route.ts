import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Lista de e-mails permitidos separada por vírgula no arquivo .env, removendo espaços extras
const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

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
      const userEmail = user.email?.toLowerCase();
      
      console.log("Tentativa de login. E-mail recebido:", userEmail);
      console.log("Lista de e-mails permitidos na Vercel:", allowedEmails);
      
      if (allowedEmails.length === 0) {
        console.error("ERRO: A variável ALLOWED_EMAILS está vazia na Vercel.");
        return false;
      }
      
      if (userEmail && allowedEmails.includes(userEmail)) {
        console.log("Login autorizado para:", userEmail);
        return true;
      }
      
      console.error("ERRO: E-mail não autorizado:", userEmail);
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
