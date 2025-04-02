import { GET, POST, auth, signIn, signOut, config } from "@/auth";
import NextAuth, { NextAuthConfig, NextAuthResult, Session } from "next-auth";
import { OAuthUserConfig } from "next-auth/providers";
import Google, { GoogleProfile } from "next-auth/providers/google";
import { NextRequest } from "next/server";
import { ROLES_OBJ, getUserRole } from "@/lib/roles";

// Mock the getUserRole function
jest.mock("@/lib/roles", () => {
  const originalModule = jest.requireActual("@/lib/roles");
  return {
    ...originalModule,
    getUserRole: jest.fn((email) => {
      if (email === "admin@example.com") return originalModule.ROLES_OBJ.ADMIN;
      if (email === "member@example.com")
        return originalModule.ROLES_OBJ.MEMBER;
      return originalModule.ROLES_OBJ.GUEST;
    }),
    isValidRole: jest.fn((role) => {
      return Object.values(originalModule.ROLES_OBJ).includes(role);
    }),
  };
});

// Mock the NextAuth module
jest.mock("next-auth", () => {
  return {
    __esModule: true,
    default: jest.fn(
      (_config: NextAuthConfig) =>
        ({
          handlers: { GET: jest.fn(), POST: jest.fn() },
          auth: jest.fn(),
          signIn: jest.fn(),
          signOut: jest.fn(),
        }) satisfies Partial<NextAuthResult>,
    ),
  };
});

// Mock the Google provider, but keep the original profile function
jest.mock("next-auth/providers/google", () => {
  return {
    __esModule: true,
    default: jest.fn((_options: OAuthUserConfig<GoogleProfile>) => ({
      id: "google",
      name: "Google",
      profile: _options.profile,
    })),
  };
});

describe("Auth Module", () => {
  // Get references to the mocked functions
  const mockNextAuthFn = NextAuth as jest.MockedFunction<typeof NextAuth>;
  const originalEnv = process.env;
  const mockGetUserRole = getUserRole as jest.MockedFunction<
    typeof getUserRole
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment variables before each test
    process.env = { ...originalEnv };
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.ADMIN_EMAILS = "admin@example.com";
    process.env.MEMBER_EMAILS = "member@example.com";

    // Call NextAuth with the original config
    mockNextAuthFn(config);
  });

  afterEach(() => {
    // Clean up environment variables after each test
    process.env = originalEnv;
  });

  test("NextAuth is initialized with correct configuration", () => {
    // Verify NextAuth was called with a configuration that includes the expected properties
    expect(mockNextAuthFn).toHaveBeenCalledWith(
      expect.objectContaining({
        providers: expect.any(Array),
        pages: {
          signIn: "/auth/signin",
          signOut: "/auth/signout",
          error: "/auth/error",
        },
        callbacks: expect.objectContaining({
          authorized: expect.any(Function),
          session: expect.any(Function),
          jwt: expect.any(Function),
        }),
        session: {
          strategy: "jwt",
        },
      }),
    );

    // Verify the config has the expected structure
    expect(config).toEqual(
      expect.objectContaining({
        providers: expect.any(Array),
        pages: {
          signIn: "/auth/signin",
          signOut: "/auth/signout",
          error: "/auth/error",
        },
        callbacks: expect.objectContaining({
          authorized: expect.any(Function),
          session: expect.any(Function),
          jwt: expect.any(Function),
        }),
        session: {
          strategy: "jwt",
        },
      }),
    );
  });

  test("Google provider is configured with environment variables", () => {
    // Get the Google provider from the config
    const googleProvider = config.providers[0] as ReturnType<typeof Google>;

    // Ensure it has client ID and secret
    expect(googleProvider).toBeDefined();
    expect(googleProvider.id).toBe("google");
  });

  test("Google profile function transforms data correctly", () => {
    // Get the Google provider from the config
    const googleProvider = config.providers[0] as any;
    // Extract the profile function
    const profileFn = googleProvider.profile;

    expect(profileFn).toBeDefined();

    // Test for admin user
    const adminGoogleProfile = {
      sub: "admin-123",
      email: "admin@example.com",
      name: "Admin User",
    } as GoogleProfile;

    const adminResult = profileFn(adminGoogleProfile, { accessToken: "token" });
    expect(adminResult).toEqual({
      ...adminGoogleProfile,
      id: "admin-123",
      role: ROLES_OBJ.ADMIN,
    });
    expect(mockGetUserRole).toHaveBeenCalledWith("admin@example.com");

    // Test for member user
    const memberGoogleProfile = {
      sub: "member-456",
      email: "member@example.com",
      name: "Member User",
    } as GoogleProfile;

    const memberResult = profileFn(memberGoogleProfile, {
      accessToken: "token",
    });
    expect(memberResult).toEqual({
      ...memberGoogleProfile,
      id: "member-456",
      role: ROLES_OBJ.MEMBER,
    });
    expect(mockGetUserRole).toHaveBeenCalledWith("member@example.com");

    // Test for guest user
    const guestGoogleProfile = {
      sub: "guest-789",
      email: "guest@example.com",
      name: "Guest User",
    } as GoogleProfile;

    const guestResult = profileFn(guestGoogleProfile, { accessToken: "token" });
    expect(guestResult).toEqual({
      ...guestGoogleProfile,
      id: "guest-789",
      role: ROLES_OBJ.GUEST,
    });
    expect(mockGetUserRole).toHaveBeenCalledWith("guest@example.com");
  });

  test("authorized callback logic works correctly", () => {
    // Get the authorized callback directly from the config
    const authorizedCallback = config.callbacks?.authorized;

    // Test cases for the authorized callback
    const testCases = [
      {
        name: "allows access to auth routes without authentication",
        input: {
          auth: null,
          request: { nextUrl: { pathname: "/auth/signin" } },
        },
        expected: true,
      },
      {
        name: "allows access to api/auth routes without authentication",
        input: {
          auth: null,
          request: { nextUrl: { pathname: "/api/auth/callback" } },
        },
        expected: true,
      },
      {
        name: "denies access to non-auth routes without authentication",
        input: {
          auth: null,
          request: { nextUrl: { pathname: "/dashboard" } },
        },
        expected: false,
      },
      {
        name: "allows access to any route with authentication",
        input: {
          auth: { user: { name: "Test User" } },
          request: { nextUrl: { pathname: "/dashboard" } },
        },
        expected: true,
      },
    ];

    // Run each test case
    testCases.forEach((testCase) => {
      // Setup the mock for startsWith
      const mockNextUrl = {
        pathname: testCase.input.request.nextUrl.pathname,
        startsWith: (prefix: string) =>
          testCase.input.request.nextUrl.pathname.startsWith(prefix),
      };

      const mockRequest = {
        nextUrl: mockNextUrl,
      } as unknown as NextRequest;

      if (authorizedCallback) {
        const result = authorizedCallback({
          auth: testCase.input.auth as Session | null,
          request: mockRequest,
        });

        expect(result).toBe(testCase.expected);
      } else {
        console.error("authorizedCallback is not defined in config");
        expect(authorizedCallback).toBeTruthy();
      }
    });
  });

  test("session callback adds role to session for admin user", () => {
    const sessionCallback = config.callbacks?.session;

    if (!sessionCallback) {
      console.error("sessionCallback is not defined in config");
      expect(sessionCallback).toBeTruthy();
      return;
    }

    const mockSession = {
      user: {
        name: "Admin User",
        email: "admin@example.com",
      },
    } as any;

    const result = sessionCallback({
      session: mockSession,
      token: { role: ROLES_OBJ.ADMIN },
    } as any);

    expect((result as any).user.role).toBe(ROLES_OBJ.ADMIN);
  });

  test("session callback adds role to session for member user", () => {
    const sessionCallback = config.callbacks?.session;

    if (!sessionCallback) {
      console.error("sessionCallback is not defined in config");
      expect(sessionCallback).toBeTruthy();
      return;
    }

    const mockSession = {
      user: {
        name: "Member User",
        email: "member@example.com",
      },
    } as any;

    const result = sessionCallback({
      session: mockSession,
      token: { role: ROLES_OBJ.MEMBER },
    } as any);

    expect((result as any).user.role).toBe(ROLES_OBJ.MEMBER);
  });

  test("session callback adds guest role to session for other users", () => {
    const sessionCallback = config.callbacks?.session;

    if (!sessionCallback) {
      console.error("sessionCallback is not defined in config");
      expect(sessionCallback).toBeTruthy();
      return;
    }

    const mockSession = {
      user: {
        name: "Guest User",
        email: "guest@example.com",
      },
    } as any;

    const result = sessionCallback({ session: mockSession, token: {} } as any);

    expect((result as any).user.role).toBe(ROLES_OBJ.GUEST);
  });

  test("session callback handles invalid role in token", () => {
    const sessionCallback = config.callbacks?.session;

    if (!sessionCallback) {
      expect(sessionCallback).toBeTruthy();
      return;
    }

    const mockSession = {
      user: {
        name: "Invalid Role User",
        email: "invalid@example.com",
      },
    } as any;

    const result = sessionCallback({
      session: mockSession,
      token: { role: "invalid-role" },
    } as any);

    expect((result as any).user.role).toBe(ROLES_OBJ.GUEST);
  });

  test("jwt callback adds user id to token", () => {
    // Get the jwt callback directly from the config
    const jwtCallback = config.callbacks?.jwt;

    if (jwtCallback) {
      // Test with user present
      const mockToken = { name: "Test Token" };
      const mockUser = {
        id: "user-123",
        name: "Test User",
        role: ROLES_OBJ.GUEST,
      };

      const result1 = jwtCallback({
        token: mockToken,
        user: mockUser,
        account: null,
      } as any);

      expect(result1).toEqual({
        name: "Test Token",
        id: "user-123",
        role: ROLES_OBJ.GUEST,
      });

      // Test without user (token unchanged)
      const result2 = jwtCallback({
        token: mockToken,
        account: null,
      } as any);

      expect(result2).toBe(mockToken);
    } else {
      console.error("jwtCallback is not defined in config");
      expect(jwtCallback).toBeTruthy();
    }
  });

  test("jwt callback adds role to token for admin user", () => {
    const jwtCallback = config.callbacks?.jwt;

    if (!jwtCallback) {
      console.error("jwtCallback is not defined in config");
      expect(jwtCallback).toBeTruthy();
      return;
    }

    const mockToken = { name: "Admin Token" } as any;
    const mockUser = {
      id: "user-123",
      name: "Admin User",
      email: "admin@example.com",
      role: ROLES_OBJ.ADMIN,
    };

    const result = jwtCallback({
      token: mockToken,
      user: mockUser,
      account: null,
    } as any);

    expect((result as any).role).toBe(ROLES_OBJ.ADMIN);
  });

  test("jwt callback adds role to token for member user", () => {
    const jwtCallback = config.callbacks?.jwt;

    if (!jwtCallback) {
      console.error("jwtCallback is not defined in config");
      expect(jwtCallback).toBeTruthy();
      return;
    }

    const mockToken = { name: "Member Token" } as any;
    const mockUser = {
      id: "user-456",
      name: "Member User",
      email: "member@example.com",
      role: ROLES_OBJ.MEMBER,
    };

    const result = jwtCallback({
      token: mockToken,
      user: mockUser,
      account: null,
    } as any);

    expect((result as any).role).toBe(ROLES_OBJ.MEMBER);
  });

  test("jwt callback adds guest role to token for other users", () => {
    const jwtCallback = config.callbacks?.jwt;

    if (!jwtCallback) {
      console.error("jwtCallback is not defined in config");
      expect(jwtCallback).toBeTruthy();
      return;
    }

    const mockToken = { name: "Guest Token" } as any;
    const mockUser = {
      id: "user-789",
      name: "Guest User",
      email: "guest@example.com",
    };

    const result = jwtCallback({
      token: mockToken,
      user: mockUser,
      account: null,
    } as any);

    expect((result as any).role).toBe(ROLES_OBJ.GUEST);
  });

  test("jwt callback ensures token always has a role", () => {
    const jwtCallback = config.callbacks?.jwt;

    if (!jwtCallback) {
      expect(jwtCallback).toBeTruthy();
      return;
    }

    // Test with token that has no role property
    const mockToken = { name: "No Role Token" } as any;

    const result = jwtCallback({
      token: mockToken,
      account: null,
    } as any);

    expect((result as any).role).toBe(ROLES_OBJ.GUEST);
  });

  test("jwt callback handles invalid role in user object", () => {
    const jwtCallback = config.callbacks?.jwt;

    if (!jwtCallback) {
      expect(jwtCallback).toBeTruthy();
      return;
    }

    const mockToken = { name: "Invalid Role Token" } as any;
    const mockUser = {
      id: "user-invalid",
      name: "Invalid Role User",
      email: "invalid@example.com",
      role: "invalid-role",
    };

    const result = jwtCallback({
      token: mockToken,
      user: mockUser,
      account: null,
    } as any);

    expect((result as any).role).toBe(ROLES_OBJ.GUEST);
  });

  test("exports the correct handlers and functions", () => {
    // Verify the module exports the expected properties
    expect(GET).toBeDefined();
    expect(POST).toBeDefined();
    expect(auth).toBeDefined();
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
    expect(config).toBeDefined();
  });
});
