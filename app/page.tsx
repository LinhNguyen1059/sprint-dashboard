"use client";

import { LoginForm } from "@/components/LoginForm";
import { Member } from "@/components/member";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { authenticated, isAuthChecking } = useAuth();

  if (isAuthChecking) return null;

  return authenticated ? <Member /> : <LoginForm />;
}
