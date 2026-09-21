"use client";

import { useSSOCallback } from "@codeswayam/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { status, error } = useSSOCallback();

  useEffect(() => {
    if (status === "success") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (error || status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4 p-6 text-center">
        <p className="text-destructive font-medium">Authentication failed: {error || "Unable to complete sign-in"}</p>
        <a
          href="/"
          className="text-primary hover:underline text-sm font-medium"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm font-medium">Signing you in...</p>
    </div>
  );
}
