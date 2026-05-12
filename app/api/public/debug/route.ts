import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const integrations = await prisma.integration.findMany({
    select: { id: true, userId: true, instagramId: true, pageId: true, name: true, createdAt: true },
  });
  return NextResponse.json({ integrations, webhookReceivesId: "17841480432297842" });
}
