import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getUserRole, ROLES_OBJ, isValidRole } from "@/lib/roles";

export const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          ...profile,
          id: profile.sub,
          role: getUserRole(profile.email),
        };
      },
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

    session({ session, token }) {
      if (session.user) {
        session.user.role = isValidRole(token.role)
          ? token.role
          : ROLES_OBJ.GUEST;
      }
      return session;
    },

    jwt({ token, user }) {
      // If user exists, update token with user id and role
      if (user) {
        token.id = user.id;
        token.role = isValidRole(user.role) ? user.role : ROLES_OBJ.GUEST;
      }
      // Ensure token always has a role
      if (!token.role) {
        token.role = ROLES_OBJ.GUEST;
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
