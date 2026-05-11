import { onAuthenticatedUser } from "@/actions/user";
import { redirect } from "next/navigation";
import SubscriptionClient from "@/components/subscription/SubscriptionClient";

export default async function SubscriptionPage() {
  const user = await onAuthenticatedUser();
  if (!user || !user.id) redirect("/sign-in");
  return <SubscriptionClient />;
}
