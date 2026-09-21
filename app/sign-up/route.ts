import { redirect } from "next/navigation";
import { getSsoRegisterUrl } from "@/lib/platform/sso";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const returnUrl = request.nextUrl.searchParams.get("returnUrl") || undefined;
  redirect(getSsoRegisterUrl(returnUrl));
}
