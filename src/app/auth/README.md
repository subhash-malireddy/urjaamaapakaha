# Authentication System

This directory contains the authentication system for the application, built using Auth.js (NextAuth.js) with Google OAuth provider.

## Setup Instructions

1. Create a Google OAuth application in the [Google Cloud Console](https://console.cloud.google.com/).
2. Configure the OAuth consent screen and create OAuth credentials (Client ID and Client Secret).
3. Add the following redirect URIs to your Google OAuth application:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
4. Update the `.env.local` file with your Google OAuth credentials:

   ```
   # Auth.js / NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   ```

   For production, make sure to set these environment variables in your hosting provider's dashboard.

5. Generate a secure random string for `NEXTAUTH_SECRET` using a tool like:
   ```
   openssl rand -base64 32
   ```

## Usage

### Authentication Status

The authentication status is displayed on the home page. Users can sign in or sign out from there.

### Protected Routes

Routes under `/protected/*` are automatically protected and require authentication. If a user tries to access a protected route without being authenticated, they will be redirected to the sign-in page.

### Authentication Hooks

To check if a user is authenticated in a server component:

```tsx
import { auth } from "@/app/auth";

export default async function MyServerComponent() {
  const session = await auth();

  if (session) {
    // User is authenticated
    return <div>Welcome, {session.user.name}!</div>;
  } else {
    // User is not authenticated
    return <div>Please sign in</div>;
  }
}
```

### Sign In and Sign Out

To sign in or sign out programmatically:

```tsx
import { signIn, signOut } from "@/app/auth";

// Sign in
await signIn("google", { redirectTo: "/" });

// Sign out
await signOut({ redirectTo: "/" });
```

## Authentication Pages

The following authentication pages are available:

- `/auth/signin` - Sign-in page
- `/auth/signout` - Sign-out page
- `/auth/error` - Error page for authentication errors

## Testing

Tests for the authentication system are located in the `__tests__/auth` directory. Run the tests with:

```
npm test
```

or

```
pnpm test
```
