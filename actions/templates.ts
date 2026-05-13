"use server";

import { getAuthUserId } from "@/lib/auth";
import { TemplateService } from "@/lib/templates";
import { revalidatePath } from "next/cache";

async function getCurrentUserId() {
  return getAuthUserId();
}

export async function getTemplates(tier?: string, category?: string) {
  return TemplateService.getTemplates(tier, category);
}

export async function getTemplate(id: string) {
  return TemplateService.getTemplate(id);
}

export async function useTemplate(templateId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const automation = await TemplateService.useTemplate(templateId, userId);
    revalidatePath("/automations");
    return { success: true, data: automation };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to use template" };
  }
}

export async function getTemplateCategories() {
  return TemplateService.getCategories();
}

export async function seedTemplates() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return { success: false, error: "Not allowed in production" };
  }
  
  await TemplateService.seedDefaultTemplates();
  return { success: true };
}