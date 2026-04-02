"use client";

import { LoginForm } from "@/components/LoginForm";
import { Project } from "@/components/project";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { authenticated, isAuthChecking } = useAuth();

  if (isAuthChecking) return null;

  return authenticated ? <Project /> : <LoginForm />;
}
