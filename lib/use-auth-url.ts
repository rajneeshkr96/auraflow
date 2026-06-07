"use client";

import { useEffect, useState } from "react";

export function useAuthUrl() {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const getAuthUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003";
    if (!currentUrl) return `${baseUrl}${path}`;
    return `${baseUrl}${path}?redirect=${encodeURIComponent(currentUrl)}`;
  };

  return { getAuthUrl };
}
