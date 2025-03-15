import {
  getUserRole,
  Role,
  isRoleAdmin,
  isRoleMember,
  isRoleGuest,
} from "@/lib/roles";

// Mock environment variables
const originalEnv = process.env;

describe("Role System", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.ADMIN_EMAILS = "admin@example.com,another-admin@example.com";
    process.env.MEMBER_EMAILS = "member@example.com,another-member@example.com";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getUserRole", () => {
    test("returns ADMIN role for admin emails", () => {
      expect(getUserRole("admin@example.com")).toBe(Role.ADMIN);
      expect(getUserRole("another-admin@example.com")).toBe(Role.ADMIN);
    });

    test("returns MEMBER role for member emails", () => {
      expect(getUserRole("member@example.com")).toBe(Role.MEMBER);
      expect(getUserRole("another-member@example.com")).toBe(Role.MEMBER);
    });

    test("returns GUEST role for any other email", () => {
      expect(getUserRole("random@example.com")).toBe(Role.GUEST);
      expect(getUserRole("unknown@example.com")).toBe(Role.GUEST);
    });

    test("handles case insensitivity correctly", () => {
      expect(getUserRole("ADMIN@example.com")).toBe(Role.ADMIN);
      expect(getUserRole("Member@Example.com")).toBe(Role.MEMBER);
    });

    test("handles whitespace in environment variables", () => {
      process.env.ADMIN_EMAILS =
        "admin@example.com, whitespace-admin@example.com";
      expect(getUserRole("whitespace-admin@example.com")).toBe(Role.ADMIN);
    });

    test("handles empty environment variables", () => {
      process.env.ADMIN_EMAILS = "";
      process.env.MEMBER_EMAILS = "";
      expect(getUserRole("admin@example.com")).toBe(Role.GUEST);
      expect(getUserRole("member@example.com")).toBe(Role.GUEST);
    });

    test("handles undefined environment variables", () => {
      delete process.env.ADMIN_EMAILS;
      delete process.env.MEMBER_EMAILS;
      expect(getUserRole("admin@example.com")).toBe(Role.GUEST);
      expect(getUserRole("member@example.com")).toBe(Role.GUEST);
    });
  });

  describe("Role check utilities", () => {
    test("isAdmin returns true only for admin role", () => {
      expect(isRoleAdmin(Role.ADMIN)).toBe(true);
      expect(isRoleAdmin(Role.MEMBER)).toBe(false);
      expect(isRoleAdmin(Role.GUEST)).toBe(false);
    });

    test("isMember returns true only for member role", () => {
      expect(isRoleMember(Role.ADMIN)).toBe(false);
      expect(isRoleMember(Role.MEMBER)).toBe(true);
      expect(isRoleMember(Role.GUEST)).toBe(false);
    });

    test("isGuest returns true only for guest role", () => {
      expect(isRoleGuest(Role.ADMIN)).toBe(false);
      expect(isRoleGuest(Role.MEMBER)).toBe(false);
      expect(isRoleGuest(Role.GUEST)).toBe(true);
    });
  });
});
