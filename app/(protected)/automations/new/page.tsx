import { onAuthenticatedUser } from "@/actions/user";
import { createAutomation } from "@/actions/automations";
import { redirect } from "next/navigation";
import { getSsoLoginUrl } from "@/lib/platform/sso";

export default async function CreateAutomation() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) return redirect(getSsoLoginUrl("/automations/new"));

  const result = await createAutomation("Untitled Automation", false);

  if (result.success && "data" in result && result.data?.id) {
    redirect(`/automations/${result.data.id}`);
  } else if ("needsUpgrade" in result && result.needsUpgrade) {
    redirect("/automations?limitReached=true");
  } else {
    redirect("/automations");
  }
}
