import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────
// Role → default redirect URL
// ─────────────────────────────────────────────────────
export const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN: "/dashboard",
  PROCUREMENT_OFFICER: "/rfqs",
  MANAGER: "/approvals",
  VENDOR: "/quotations",
};

// ─────────────────────────────────────────────────────
// NextAuth v5 configuration
// ─────────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  // NOTE: We use JWT strategy (not Prisma adapter sessions) because the
  // existing Session model doesn't conform to NextAuth's adapter schema.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        // Fetch user — using Prisma model name "User" with @@map("users")
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            isActive: true,
            deletedAt: true,
          },
        });

        if (!user || user.deletedAt !== null) {
          throw new Error("INVALID_CREDENTIALS");
        }

        // Only active users can log in
        if (!user.isActive) {
          throw new Error("ACCOUNT_INACTIVE");
        }

        // Verify password against bcrypt hash
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        // Update last_login_at timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, embed role into JWT
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose id and role on the client session
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
