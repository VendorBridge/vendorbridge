import type { NextAuthConfig } from "next-auth";

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
// Edge-compatible NextAuth configuration
// ─────────────────────────────────────────────────────
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
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
  providers: [], // Providers are added in Node-only environment (auth.ts)
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
