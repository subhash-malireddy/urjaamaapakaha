import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getUserRole } from "@/lib/roles";

export const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Allow access to auth-related pages without authentication
      const isAuthRoute =
        nextUrl.pathname.startsWith("/auth") ||
        nextUrl.pathname.startsWith("/api/auth");

      // If it's an auth route, allow access regardless of login status
      if (isAuthRoute) return true;

      // For all other routes, require authentication
      return isLoggedIn;
    },
    /**
     * //TODO::
     * Verify with the nextjs docs to see what parameters are passed to this and jwtcallback.
     * Check if some parameters are optional and can be undefined or null.
     * If so list out the scenarios when they can be falsy.
     * When a value is falsy, what is the fallback value? Or what other value could be used?
     * ## We need email like value to get the role.##
     */

    session({ session }) {
      // Add role to the session if user exists
      if (session.user?.email) {
        session.user.role = getUserRole(session.user.email);
      }
      return session;
    },

    //TODO:: Investiage if we need this callback at all
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Add role to the token if email exists
        if (user.email) {
          token.role = getUserRole(user.email);
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config);
