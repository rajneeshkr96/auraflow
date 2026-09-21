/**
 * Backward compatibility wrapper for legacy auth imports
 * All new code should import from @/lib/platform/auth directly
 */
import { getAuthSession, getAuthUserId as getPlatformAuthUserId } from "./platform/auth";

export const auth = async () => {
  const session = await getAuthSession();
  return {
    userId: session.user ? String(session.user.userId) : null,
    error: session.error,
  };
};

export const getAuthUserId = async (): Promise<number | null> => {
  return getPlatformAuthUserId();
};
