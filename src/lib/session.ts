import { auth } from "@/auth";
import { Role, isRoleAdmin, isRoleMember, isRoleGuest } from "./roles";

/**
 * Gets the current user's role from the session
 * @returns The user's role or null if not authenticated
 */
export async function getUserRoleFromSession(): Promise<Role | null> {
  const session = await auth();
  return session?.user?.role || null;
}

/**
 * Checks if the current user is an admin
 * @returns True if the user is an admin, false otherwise
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const role = await getUserRoleFromSession();
  return role !== null && isRoleAdmin(role);
}

/**
 * Checks if the current user is a member (admin or member)
 * @returns True if the user is a member, false otherwise
 */
export async function isCurrentUserMember(): Promise<boolean> {
  const role = await getUserRoleFromSession();
  return role !== null && isRoleMember(role);
}

/**
 * Checks if the current user is a guest
 * @returns True if the user is a guest, false otherwise
 */
export async function isCurrentUserGuest(): Promise<boolean> {
  const role = await getUserRoleFromSession();
  return role !== null && isRoleGuest(role);
}

/**
 * Checks if the current user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}
