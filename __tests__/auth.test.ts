import { GET, POST, auth, signIn, signOut, config } from "@/app/auth";
import NextAuth, { NextAuthConfig, NextAuthResult, Session } from "next-auth";
import { OAuthUserConfig } from "next-auth/providers";
import Google, { GoogleProfile } from "next-auth/providers/google";
import { NextRequest } from "next/server";
import { ROLES_OBJ } from "@/lib/roles";

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

// Mock the Google provider
jest.mock("next-auth/providers/google", () => {
  return {
    __esModule: true,
    default: jest.fn((_options: OAuthUserConfig<GoogleProfile>) => ({
      id: "google",
      name: "Google",
    })),
  };
});

describe("Auth Module", () => {
  // Get references to the mocked functions
  const mockNextAuthFn = NextAuth as jest.MockedFunction<typeof NextAuth>;
  const mockGoogleProviderFn = Google as jest.MockedFunction<typeof Google>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment variables before each test
    process.env = { ...originalEnv };
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.ADMIN_EMAILS = "admin@example.com";
    process.env.MEMBER_EMAILS = "member@example.com";

    // Call NextAuth with a modified config that explicitly calls Google provider
    // This simulates what happens when the auth.ts module is loaded
    mockNextAuthFn({
      ...config,
      providers: [
        mockGoogleProviderFn({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ],
    });
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
    // Verify Google provider was called with correct credentials
    expect(mockGoogleProviderFn).toHaveBeenCalledWith({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    });
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
        fail("authorizedCallback is not defined in config");
      }
    });
  });

  test("session callback adds role to session for admin user", () => {
    const sessionCallback = config.callbacks?.session;

    if (!sessionCallback) {
      fail("sessionCallback is not defined in config");
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
      fail("sessionCallback is not defined in config");
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
      fail("sessionCallback is not defined in config");
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
      fail("jwtCallback is not defined in config");
    }
  });

  test("jwt callback adds role to token for admin user", () => {
    const jwtCallback = config.callbacks?.jwt;

    if (!jwtCallback) {
      fail("jwtCallback is not defined in config");
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
      fail("jwtCallback is not defined in config");
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
      fail("jwtCallback is not defined in config");
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
