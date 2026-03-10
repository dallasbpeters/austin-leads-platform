import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function normalizeEmail(value) {
  return value?.toString().trim().toLowerCase();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password?.toString();
        const adminEmail = normalizeEmail(process.env.AUTH_ADMIN_EMAIL);
        const adminPassword = process.env.AUTH_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          return null;
        }

        if (email !== adminEmail || password !== adminPassword) {
          return null;
        }

        return {
          id: "platform-admin",
          email: adminEmail,
          name: process.env.AUTH_ADMIN_NAME || "Platform Admin",
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
      }

      return session;
    },
  },
});
