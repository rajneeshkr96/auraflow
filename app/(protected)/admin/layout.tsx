import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/platform/auth";
import { isAdmin } from "@/lib/platform/rbac";
import type { ReactNode } from "react";

/**
 * Admin layout — server-side role guard.
 * Only users with role "admin" or "superadmin" can access /admin routes.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession();

  if (!session.user || !isAdmin(session.user)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-2">
      {/* Admin section banner */}
      <div className="flex items-center gap-2 px-1 pb-2 border-b border-dashed border-primary/20 mb-6">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
          Admin Console
        </span>
        <span className="text-[10px] text-muted-foreground">· Auraflow</span>
      </div>
      {children}
    </div>
  );
}
