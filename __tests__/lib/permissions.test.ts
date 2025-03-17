import { hasPermission, Permissions } from "@/lib/permissions";
import { ROLES_OBJ } from "@/lib/roles";

describe("Permission System", () => {
  describe("Permission Constants", () => {
    it("should define all required permissions", () => {
      expect(Permissions).toBeDefined();
      expect(Permissions.VIEW_DEVICES).toBeDefined();
      expect(Permissions.CONTROL_DEVICES).toBeDefined();
      expect(Permissions.VIEW_USAGE_DATA).toBeDefined();
      expect(Permissions.MANAGE_DEVICES).toBeDefined();
    });

    it("should have unique permission values", () => {
      const permissionValues = Object.values(Permissions);
      const uniqueValues = new Set(permissionValues);
      expect(uniqueValues.size).toBe(permissionValues.length);
    });
  });

  describe("Role-Permission Mapping; Testing func hasPermission", () => {
    it("should grant appropriate permissions to ADMIN role", () => {
      expect(hasPermission(ROLES_OBJ.ADMIN, Permissions.VIEW_DEVICES)).toBe(
        true,
      );
      expect(hasPermission(ROLES_OBJ.ADMIN, Permissions.CONTROL_DEVICES)).toBe(
        false,
      );
      expect(hasPermission(ROLES_OBJ.ADMIN, Permissions.VIEW_USAGE_DATA)).toBe(
        true,
      );
      expect(hasPermission(ROLES_OBJ.ADMIN, Permissions.MANAGE_DEVICES)).toBe(
        true,
      );
    });

    it("should grant appropriate permissions to MEMBER role", () => {
      expect(hasPermission(ROLES_OBJ.MEMBER, Permissions.VIEW_DEVICES)).toBe(
        true,
      );
      expect(hasPermission(ROLES_OBJ.MEMBER, Permissions.CONTROL_DEVICES)).toBe(
        true,
      );
      expect(hasPermission(ROLES_OBJ.MEMBER, Permissions.VIEW_USAGE_DATA)).toBe(
        true,
      );
      expect(hasPermission(ROLES_OBJ.MEMBER, Permissions.MANAGE_DEVICES)).toBe(
        false,
      );
    });

    it("should grant appropriate permissions to GUEST role", () => {
      expect(hasPermission(ROLES_OBJ.GUEST, Permissions.VIEW_DEVICES)).toBe(
        true,
      );
      expect(hasPermission(ROLES_OBJ.GUEST, Permissions.CONTROL_DEVICES)).toBe(
        false,
      );
      expect(hasPermission(ROLES_OBJ.GUEST, Permissions.VIEW_USAGE_DATA)).toBe(
        true,
      );
      expect(hasPermission(ROLES_OBJ.GUEST, Permissions.MANAGE_DEVICES)).toBe(
        false,
      );
    });
  });
});
