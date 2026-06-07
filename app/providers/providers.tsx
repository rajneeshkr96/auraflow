"use client";

import React from "react";
import { CSWProvider } from "@codeswayam/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CSWProvider
      apiUrl={process.env.NEXT_PUBLIC_API_URL}
      ssoUrl={process.env.NEXT_PUBLIC_APP_AUTH_URL}
    >
      {children}
    </CSWProvider>
  );
}
