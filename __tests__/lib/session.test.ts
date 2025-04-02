import { auth } from "@/auth";
import { ROLES_OBJ } from "@/lib/roles";
import {
  getUserRoleFromSession,
  isCurrentUserAdmin,
  isCurrentUserMember,
  isCurrentUserGuest,
  isAuthenticated,
} from "@/lib/session";

// Mock the auth function
jest.mock("@/app/auth", () => ({
  auth: jest.fn(),
}));

describe("Session Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserRoleFromSession", () => {
    test("returns role from session", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Test User",
          email: "test@example.com",
          role: ROLES_OBJ.ADMIN,
        },
      });

      const result = await getUserRoleFromSession();
      expect(result).toBe(ROLES_OBJ.ADMIN);
    });

    test("returns null if no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getUserRoleFromSession();
      expect(result).toBeNull();
    });

    test("returns null if no user in session", async () => {
      (auth as jest.Mock).mockResolvedValue({});

      const result = await getUserRoleFromSession();
      expect(result).toBeNull();
    });

    test("returns null if no role in user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Test User",
          email: "test@example.com",
        },
      });

      const result = await getUserRoleFromSession();
      expect(result).toBeNull();
    });
  });

  describe("isCurrentUserAdmin", () => {
    test("returns true for admin user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Admin User",
          email: "admin@example.com",
          role: ROLES_OBJ.ADMIN,
        },
      });

      const result = await isCurrentUserAdmin();
      expect(result).toBe(true);
    });

    test("returns false for member user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Member User",
          email: "member@example.com",
          role: ROLES_OBJ.MEMBER,
        },
      });

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    test("returns false for guest user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Guest User",
          email: "guest@example.com",
          role: ROLES_OBJ.GUEST,
        },
      });

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    test("returns false if no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });
  });

  describe("isCurrentUserMember", () => {
    test("returns false for admin user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Admin User",
          email: "admin@example.com",
          role: ROLES_OBJ.ADMIN,
        },
      });

      const result = await isCurrentUserMember();
      expect(result).toBe(false);
    });

    test("returns true for member user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Member User",
          email: "member@example.com",
          role: ROLES_OBJ.MEMBER,
        },
      });

      const result = await isCurrentUserMember();
      expect(result).toBe(true);
    });

    test("returns false for guest user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Guest User",
          email: "guest@example.com",
          role: ROLES_OBJ.GUEST,
        },
      });

      const result = await isCurrentUserMember();
      expect(result).toBe(false);
    });

    test("returns false if no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await isCurrentUserMember();
      expect(result).toBe(false);
    });
  });

  describe("isCurrentUserGuest", () => {
    test("returns false for admin user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Admin User",
          email: "admin@example.com",
          role: ROLES_OBJ.ADMIN,
        },
      });

      const result = await isCurrentUserGuest();
      expect(result).toBe(false);
    });

    test("returns false for member user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Member User",
          email: "member@example.com",
          role: ROLES_OBJ.MEMBER,
        },
      });

      const result = await isCurrentUserGuest();
      expect(result).toBe(false);
    });

    test("returns true for guest user", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Guest User",
          email: "guest@example.com",
          role: ROLES_OBJ.GUEST,
        },
      });

      const result = await isCurrentUserGuest();
      expect(result).toBe(true);
    });

    test("returns false if no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await isCurrentUserGuest();
      expect(result).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    test("returns true if session with user exists", async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: {
          name: "Test User",
          email: "test@example.com",
        },
      });

      const result = await isAuthenticated();
      expect(result).toBe(true);
    });

    test("returns false if no session", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });

    test("returns false if session without user", async () => {
      (auth as jest.Mock).mockResolvedValue({});

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });
  });
});
