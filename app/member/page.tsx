"use client";

import { Member } from "@/components/member";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";

export default function MemberPage() {
  const { isAuthChecking, authenticated } = useAuth();

  if (isAuthChecking) {
    return null;
  }

  if (!authenticated) {
    return redirect("/");
  }

  return <Member />;
}
