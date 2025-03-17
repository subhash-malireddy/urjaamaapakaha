import { middleware, config } from "@/middleware";
import { ROLES_OBJ } from "@/lib/roles";
import { auth } from "@/app/auth";

// Mock next/server
jest.mock("next/server", () => {
  const NextResponse = jest.fn().mockImplementation((body, init) => ({
    status: init?.status || 200,
    headers: new Map(),
  }));

  return {
    NextResponse: Object.assign(NextResponse, {
      redirect: jest.fn().mockImplementation((url) => ({
        status: 307,
        headers: new Map([["Location", url.pathname]]),
      })),
    }),
  };
});

// Mock auth module
jest.mock("@/app/auth", () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.Mock;

describe("Authentication Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Middleware Configuration", () => {
    it("should have a matcher configuration", () => {
      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
    });

    it("should properly configure path exclusions", () => {
      const matcher = config.matcher[0];

      // Verify that the matcher pattern contains all necessary exclusions
      const requiredExclusions = [
        "_next/static",
        "_next/image",
        "favicon.ico",
        "public",
        "api/auth/signin",
        "api/auth/callback",
        "api/auth/signout",
        "api/auth/session",
        "api/auth/csrf",
        "api/auth/providers",
      ];

      requiredExclusions.forEach((exclusion) => {
        expect(matcher).toContain(exclusion);
      });
    });

    it("should include relevant paths in middleware", () => {
      const matcher = config.matcher[0];
      const includedPaths = [
        "/",
        "/dashboard",
        "/admin",
        "/admin/settings",
        "/auth/signin",
        "/auth/error",
      ];

      // These paths should match the middleware pattern
      includedPaths.forEach((path) => {
        expect(path).toMatch(new RegExp(matcher));
      });
    });
  });

  const createMockRequest = (pathname: string) => ({
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
  });

  it("should allow access to public routes without authentication", async () => {
    const mockReq = createMockRequest("/auth/signin");
    const response = await middleware(mockReq as any);
    expect(response).toBeUndefined();
  });

  it("should redirect unauthenticated users to signin for protected routes", async () => {
    mockAuth.mockResolvedValueOnce({ user: null });
    const mockReq = createMockRequest("/dashboard");
    const response = await middleware(mockReq as any);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307);
    expect(response?.headers.get("Location")).toBe("/auth/signin");
  });

  it("should allow authenticated users to access protected routes", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { role: ROLES_OBJ.MEMBER },
    });

    const mockReq = createMockRequest("/dashboard");
    const response = await middleware(mockReq as any);
    expect(response).toBeUndefined();
  });

  it("should deny access to admin routes for non-admin users", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { role: ROLES_OBJ.MEMBER },
    });

    const mockReq = createMockRequest("/admin/settings");
    const response = await middleware(mockReq as any);

    expect(response).toBeDefined();
    expect(response?.status).toBe(403);
  });

  it("should allow admins to access admin routes", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { role: ROLES_OBJ.ADMIN },
    });

    const mockReq = createMockRequest("/admin/settings");
    const response = await middleware(mockReq as any);
    expect(response).toBeUndefined();
  });

  it("should allow access to error pages", async () => {
    const mockReq = createMockRequest("/auth/error");
    const response = await middleware(mockReq as any);
    expect(response).toBeUndefined();
  });
});
