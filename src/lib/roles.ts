/**
 * Role object with constant values
 */
export const ROLES_OBJ = {
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
} as const;

/**
 * Role type derived from the Role object values
 */
export type Role = (typeof ROLES_OBJ)[keyof typeof ROLES_OBJ];

/**
 * Type guard to check if a value is a valid Role
 * @param value The value to check
 * @returns True if the value is a valid Role, false otherwise
 */
export function isValidRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    Object.values(ROLES_OBJ).includes(value as Role)
  );
}

/**
 * Determines the role of a user based on their email address
 * @param email The email address of the user
 * @returns The role of the user (ADMIN, MEMBER, or GUEST)
 */
export function getUserRole(email: string): Role {
  if (!email) return ROLES_OBJ.GUEST;

  const normalizedEmail = email.toLowerCase().trim();

  // Check if the email is in the ADMIN_EMAILS environment variable
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];
  if (adminEmails.includes(normalizedEmail)) {
    return ROLES_OBJ.ADMIN;
  }

  // Check if the email is in the MEMBER_EMAILS environment variable
  const memberEmails =
    process.env.MEMBER_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];
  if (memberEmails.includes(normalizedEmail)) {
    return ROLES_OBJ.MEMBER;
  }

  // Default to GUEST role
  return ROLES_OBJ.GUEST;
}

/**
 * Checks if the given role is an admin role
 * @param role The role to check
 * @returns True if the role is ADMIN, false otherwise
 */
export function isRoleAdmin(role: Role): boolean {
  return role === ROLES_OBJ.ADMIN;
}

/**
 * Checks if the given role is a member role
 * @param role The role to check
 * @returns True if the role is MEMBER, false otherwise
 */
export function isRoleMember(role: Role): boolean {
  return role === ROLES_OBJ.MEMBER;
}

/**
 * Checks if the given role is a guest role
 * @param role The role to check
 * @returns True if the role is GUEST, false otherwise
 */
export function isRoleGuest(role: Role): boolean {
  return role === ROLES_OBJ.GUEST;
}
