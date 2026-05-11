import { onAuthenticatedUser } from "@/actions/user";
import { createAutomation } from "@/actions/automations";
import { redirect } from "next/navigation";

export default async function CreateAutomation() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) return redirect("/sign-in");

  const result = await createAutomation("Untitled Automation");

  if (result.success && result.data?.id) {
    redirect(`/automations/${result.data.id}`);
  } else {
    redirect("/automations");
  }
}
