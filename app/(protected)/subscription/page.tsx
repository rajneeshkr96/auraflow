import { onAuthenticatedUser } from "@/actions/user";
import { redirect } from "next/navigation";
import SubscriptionClient from "@/components/subscription/SubscriptionClient";
import { getSsoLoginUrl } from "@/lib/platform/sso";

export default async function SubscriptionPage() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) redirect(getSsoLoginUrl("/subscription"));
  return <SubscriptionClient />;
}
