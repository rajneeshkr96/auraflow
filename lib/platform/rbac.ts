import { AuthUser, PlatformRole } from "./types";
import { requireAuthUser } from "./auth";

/**
 * Checks if a user possesses any of the required platform roles
 */
export function hasRole(user: AuthUser | null | undefined, ...requiredRoles: PlatformRole[]): boolean {
  if (!user || !user.role) return false;
  if (user.role === "superadmin") return true; // superadmin inherits all permissions
  return requiredRoles.includes(user.role);
}

/**
 * Enforces role requirement on the currently authenticated user.
 * Throws an error if user does not meet the role requirement.
 */
export async function requireRole(...requiredRoles: PlatformRole[]): Promise<AuthUser> {
  const user = await requireAuthUser();
  if (!hasRole(user, ...requiredRoles)) {
    throw new Error(`Forbidden: Requires one of [${requiredRoles.join(", ")}] roles`);
  }
  return user;
}

/**
 * Checks whether user is an admin or superadmin
 */
export function isAdmin(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "admin", "superadmin");
}
