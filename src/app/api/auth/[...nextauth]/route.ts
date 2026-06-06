import { handlers } from "@/lib/auth";

// NextAuth v5 route handler
// Handles all /api/auth/* routes (signIn, signOut, session, csrf, etc.)
export const { GET, POST } = handlers;
