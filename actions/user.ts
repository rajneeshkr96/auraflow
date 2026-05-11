"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sdk } from "@codeswayam/api-client";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";

async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("Authentication");
}

const getAuthorizedSDK = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    Cookie: `Authentication=${token}`,
  },
});

/** Fetches comprehensive user context (profile, subscriptions, wallet, integrations) */
export const onAuthenticatedUser = async () => {
  const authCookie = await getAuthCookie();
  if (!authCookie) redirect("/sign-in");

  try {
    const authOptions = getAuthorizedSDK(authCookie.value);
    const fullProfile = await sdk.getFullProfile(authOptions);

    // Integrations now come from MongoDB — no aura-api call needed
    const integrations = await getUserIntegrations();

    return {
      ...fullProfile.profile,
      subscriptions: fullProfile.subscriptions,
      wallet: fullProfile.wallet,
      integrations,
    };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") redirect("/sign-in");
    console.error("onAuthenticatedUser Error:", error.message || error);
    return null;
  }
};

/** Fetches basic user profile from Core API */
export const getUserProfile = async () => {
  const authCookie = await getAuthCookie();
  if (!authCookie) return null;

  try {
    const authOptions = getAuthorizedSDK(authCookie.value);
    const profile = await sdk.auth.getProfile(authOptions);
    return profile?.data || profile;
  } catch (error: any) {
    if (error.message !== "UNAUTHORIZED") {
      console.error("getUserProfile Error:", error.message || error);
    }
    return null;
  }
};

/** Update user profile via Core API */
export const updateUserProfile = async (data: { name?: string }) => {
  const authCookie = await getAuthCookie();
  if (!authCookie) return { success: false, error: "Unauthorized" };

  try {
    const authOptions = getAuthorizedSDK(authCookie.value);
    const response = await sdk.request("/users/profile", {
      ...authOptions,
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return { success: true, data: response };
  } catch (error: any) {
    console.error("updateUserProfile Error:", error.message);
    return { success: false, error: error.message || "Failed to update profile" };
  }
};

/** Fetches user integrations directly from MongoDB */
export const getUserIntegrations = async () => {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await prisma.integration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    console.error("getUserIntegrations Error:", error.message);
    return [];
  }
};
