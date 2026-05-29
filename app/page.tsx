"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { RoleLoginPage } from "@/components/role-login-page";
import { getStoredRole } from "@/lib/user-role";

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getStoredRole()) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F9FB] dark:bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-[#26C6DA] border-t-transparent" />
      </main>
    );
  }

  return <RoleLoginPage />;
}
