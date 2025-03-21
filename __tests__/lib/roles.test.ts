import {
  getUserRole,
  ROLES_OBJ,
  isRoleAdmin,
  isRoleMember,
  isRoleGuest,
  isValidRole,
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
      expect(getUserRole("admin@example.com")).toBe(ROLES_OBJ.ADMIN);
      expect(getUserRole("another-admin@example.com")).toBe(ROLES_OBJ.ADMIN);
    });

    test("returns MEMBER role for member emails", () => {
      expect(getUserRole("member@example.com")).toBe(ROLES_OBJ.MEMBER);
      expect(getUserRole("another-member@example.com")).toBe(ROLES_OBJ.MEMBER);
    });

    test("returns GUEST role for any other email", () => {
      expect(getUserRole("random@example.com")).toBe(ROLES_OBJ.GUEST);
      expect(getUserRole("unknown@example.com")).toBe(ROLES_OBJ.GUEST);
    });

    test("handles case insensitivity correctly", () => {
      expect(getUserRole("ADMIN@example.com")).toBe(ROLES_OBJ.ADMIN);
      expect(getUserRole("Member@Example.com")).toBe(ROLES_OBJ.MEMBER);
    });

    test("handles whitespace in environment variables", () => {
      process.env.ADMIN_EMAILS =
        "admin@example.com, whitespace-admin@example.com";
      expect(getUserRole("whitespace-admin@example.com")).toBe(ROLES_OBJ.ADMIN);
    });

    test("handles empty environment variables", () => {
      process.env.ADMIN_EMAILS = "";
      process.env.MEMBER_EMAILS = "";
      expect(getUserRole("admin@example.com")).toBe(ROLES_OBJ.GUEST);
      expect(getUserRole("member@example.com")).toBe(ROLES_OBJ.GUEST);
    });

    test("handles undefined environment variables", () => {
      delete process.env.ADMIN_EMAILS;
      delete process.env.MEMBER_EMAILS;
      expect(getUserRole("admin@example.com")).toBe(ROLES_OBJ.GUEST);
      expect(getUserRole("member@example.com")).toBe(ROLES_OBJ.GUEST);
    });

    test("returns GUEST role for empty string", () => {
      expect(getUserRole("")).toBe(ROLES_OBJ.GUEST);
    });
  });

  describe("Role check utilities", () => {
    test("isAdmin returns true only for admin role", () => {
      expect(isRoleAdmin(ROLES_OBJ.ADMIN)).toBe(true);
      expect(isRoleAdmin(ROLES_OBJ.MEMBER)).toBe(false);
      expect(isRoleAdmin(ROLES_OBJ.GUEST)).toBe(false);
    });

    test("isMember returns true only for member role", () => {
      expect(isRoleMember(ROLES_OBJ.ADMIN)).toBe(false);
      expect(isRoleMember(ROLES_OBJ.MEMBER)).toBe(true);
      expect(isRoleMember(ROLES_OBJ.GUEST)).toBe(false);
    });

    test("isGuest returns true only for guest role", () => {
      expect(isRoleGuest(ROLES_OBJ.ADMIN)).toBe(false);
      expect(isRoleGuest(ROLES_OBJ.MEMBER)).toBe(false);
      expect(isRoleGuest(ROLES_OBJ.GUEST)).toBe(true);
    });
  });

  describe("isValidRole", () => {
    test("returns true for valid roles", () => {
      expect(isValidRole(ROLES_OBJ.ADMIN)).toBe(true);
      expect(isValidRole(ROLES_OBJ.MEMBER)).toBe(true);
      expect(isValidRole(ROLES_OBJ.GUEST)).toBe(true);
    });

    test("returns false for invalid roles", () => {
      expect(isValidRole("invalid-role")).toBe(false);
      expect(isValidRole(123)).toBe(false);
      expect(isValidRole(null)).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
    });
  });
});
