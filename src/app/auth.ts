import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

console.log("🚀 ~ process.env.GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log(
  "🚀 ~ process.env.GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET,
);
console.log("🚀 ~ process.env.NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
console.log("🚀 ~ process.env.NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
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
    session({ session }) {
      return session;
    },

    //TODO:: Investiage if we need this callback at all
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
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
