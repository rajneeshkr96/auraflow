"use server";

import { redirect } from "next/navigation";
import { sdk } from "@codeswayam/api-client";
import { getRawAuthToken, getAuthUserId } from "@/lib/platform/auth";
import { IntegrationRepository } from "@/lib/domain/integration/integration.repository";

const getAuthorizedSDK = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    Cookie: `Authentication=${token}`,
  },
});

/** Fetches comprehensive user context (profile, subscriptions, wallet, integrations) */
export const onAuthenticatedUser = async () => {
  const token = await getRawAuthToken();
  if (!token) redirect("/sign-in");

  try {
    const authOptions = getAuthorizedSDK(token);
    const fullProfile = await sdk.getFullProfile(authOptions);

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
  const token = await getRawAuthToken();
  if (!token) return null;

  try {
    const authOptions = getAuthorizedSDK(token);
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
  const token = await getRawAuthToken();
  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const authOptions = getAuthorizedSDK(token);
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

/** Fetches user integrations directly from MongoDB via Repository */
export const getUserIntegrations = async () => {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await IntegrationRepository.findByUserId(userId);
  } catch (error: any) {
    console.error("getUserIntegrations Error:", error.message);
    return [];
  }
};
