"use client";

import React from "react";
import { CSWProvider } from "@codeswayam/auth";
import { AccessProvider } from "@codeswayam/access";

export function Providers({ children }: { children: React.ReactNode }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const ssoUrl = process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003";

  return (
    <CSWProvider apiUrl={apiUrl} ssoUrl={ssoUrl}>
      <AccessProvider apiUrl={apiUrl}>
        {children}
      </AccessProvider>
    </CSWProvider>
  );
}
