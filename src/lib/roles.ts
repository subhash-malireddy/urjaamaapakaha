/**
 * Role enumeration for the application
 */
export enum Role {
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

/**
 * Determines the role of a user based on their email address
 * @param email The email address of the user
 * @returns The role of the user (ADMIN, MEMBER, or GUEST)
 */
export function getUserRole(email: string): Role {
  if (!email) return Role.GUEST;

  const normalizedEmail = email.toLowerCase().trim();

  // Check if the email is in the ADMIN_EMAILS environment variable
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];
  if (adminEmails.includes(normalizedEmail)) {
    return Role.ADMIN;
  }

  // Check if the email is in the MEMBER_EMAILS environment variable
  const memberEmails =
    process.env.MEMBER_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];
  if (memberEmails.includes(normalizedEmail)) {
    return Role.MEMBER;
  }

  // Default to GUEST role
  return Role.GUEST;
}

/**
 * Checks if the given role is an admin role
 * @param role The role to check
 * @returns True if the role is ADMIN, false otherwise
 */
export function isRoleAdmin(role: Role): boolean {
  return role === Role.ADMIN;
}

/**
 * Checks if the given role is a member role
 * @param role The role to check
 * @returns True if the role is MEMBER, false otherwise
 */
export function isRoleMember(role: Role): boolean {
  return role === Role.MEMBER;
}

/**
 * Checks if the given role is a guest role
 * @param role The role to check
 * @returns True if the role is GUEST, false otherwise
 */
export function isRoleGuest(role: Role): boolean {
  return role === Role.GUEST;
}
