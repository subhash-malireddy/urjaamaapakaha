# Authentication & Authorization System

Built using Auth.js with Google OAuth provider and custom role-based permissions.

## Setup

1. Create Google OAuth app in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the OAuth consent screen and create OAuth credentials
3. Add the following redirect URIs to your Google OAuth application:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
4. Set environment variables:

```env
# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Role Assignment
ADMINS=admin1@example.com,admin2@example.com
HOUSEMATES=member1@example.com,member2@example.com
```

## Roles & Permissions

Three roles with cascading permissions:

- `ADMIN`: Manage devices + member permissions
- `MEMBER`: Control devices, view usage
- `GUEST`: View-only access to index and usage pages

## Protected Routes

Routes are protected based on role:

- Public: `/auth/*`, static files
- Admin, Guest Access (View Only): `/`, `/usage`
- Member Access (Full Control): `/`, `/usage`
- Admin Only: `/admin/*`

## Testing

Run auth-related tests:

```bash
pnpm test __tests__/auth
pnpm test __tests__/middleware
```

Mock auth in tests:

```tsx
jest.mock("@/app/auth", () => ({
  auth: jest.fn().mockResolvedValue({
    user: { role: ROLES_OBJ.MEMBER },
  }),
}));
```
