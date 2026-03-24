"use client";

import React, { useEffect } from "react";

import { LoginForm } from "@/components/LoginForm";
import { Member } from "@/components/member";
import { useAppStore } from "@/stores/appStore";
import { handleUnauthorized } from "@/lib/api-client";

export default function Home() {
  const { authenticated, setStates } = useAppStore();

  useEffect(() => {
    // Check for access_token in cookies
    const checkAuth = () => {
      const cookies = document.cookie.split(";");
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("access_token="),
      );
      setStates({ authenticated: !!accessTokenCookie });
      if (!accessTokenCookie) {
        handleUnauthorized();
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return authenticated ? <Member /> : <LoginForm />;
}
