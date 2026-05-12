import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// One-time fix: updates the wrong instagramId to the correct one from webhook logs
// Visit: /api/public/fix-integration once, then DELETE this file
export async function GET() {
  const result = await prisma.integration.updateMany({
    where: { instagramId: "25376053142097733" },
    data: { instagramId: "17841480432297842" },
  });
  return NextResponse.json({
    updated: result.count,
    message: result.count > 0
      ? "✅ Fixed! instagramId updated to 17841480432297842. Now delete this file."
      : "⚠️ No rows updated — ID may already be correct or was different.",
  });
}
