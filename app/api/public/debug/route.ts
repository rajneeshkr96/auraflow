import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import axios from "axios";

export async function GET() {
  const integrations = await prisma.integration.findMany();
  const healResults: any[] = [];

  // Self-heal: inspect each integration and sync pageId / username if missing
  for (const item of integrations) {
    if (item.token && (!item.pageId || !item.username)) {
      try {
        const res = await axios.get("https://graph.instagram.com/v21.0/me", {
          params: { fields: "id,user_id,username,name", access_token: item.token },
          timeout: 4000,
        });

        const igUserId = res.data?.user_id ? String(res.data.user_id) : null;
        const username = res.data?.username ? String(res.data.username) : null;
        const fullName = res.data?.name ? String(res.data.name) : null;

        const updateData: any = {};
        if (igUserId && !item.pageId) updateData.pageId = igUserId;
        if (username && !item.username) updateData.username = username;
        if (fullName && !item.fullName) updateData.fullName = fullName;

        if (Object.keys(updateData).length > 0) {
          await prisma.integration.update({
            where: { id: item.id },
            data: updateData,
          });
          healResults.push({ id: item.id, healed: true, updateData });
        }
      } catch (err: any) {
        healResults.push({ id: item.id, healed: false, error: err.message });
      }
    }
  }

  const updatedIntegrations = await prisma.integration.findMany({
    select: {
      id: true,
      userId: true,
      instagramId: true,
      pageId: true,
      username: true,
      fullName: true,
      name: true,
      isActive: true,
      createdAt: true,
    },
  });

  const automations = await prisma.automation.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      userId: true,
      active: true,
      triggers: true,
      keywords: true,
      listener: true,
    },
  });

  return NextResponse.json({
    status: "ok",
    integrations: updatedIntegrations,
    activeAutomationsCount: automations.length,
    activeAutomations: automations,
    healResults,
  });
}
