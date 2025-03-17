import { Role, ROLES_OBJ } from "./roles";

/**
 * Permission object with constant values
 */
export const Permissions = {
  VIEW_DEVICES: "view_devices",
  CONTROL_DEVICES: "control_devices",
  VIEW_USAGE_DATA: "view_usage_data",
  MANAGE_DEVICES: "manage_devices",
} as const;

/**
 * Permission type derived from the Permission object values
 */
export type Permission = (typeof Permissions)[keyof typeof Permissions];

/**
 * Role to Permission mapping
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES_OBJ.ADMIN]: [
    Permissions.VIEW_DEVICES,
    Permissions.VIEW_USAGE_DATA,
    Permissions.MANAGE_DEVICES,
  ],
  [ROLES_OBJ.MEMBER]: [
    Permissions.VIEW_DEVICES,
    Permissions.CONTROL_DEVICES,
    Permissions.VIEW_USAGE_DATA,
  ],
  [ROLES_OBJ.GUEST]: [Permissions.VIEW_DEVICES, Permissions.VIEW_USAGE_DATA],
};

/**
 * Checks if a role has a specific permission
 * @param role The role to check
 * @param permission The permission to check for
 * @returns True if the role has the permission, false otherwise
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
