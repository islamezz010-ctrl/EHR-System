"use client";

import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROLE_OPTIONS, setStoredRole, type UserRole } from "@/lib/user-role";

const TEAL = "#26C6DA";

const ROLE_ICONS: Record<UserRole, typeof ShieldCheck> = {
  admin: ShieldCheck,
  staff: Stethoscope,
  patient: UserRound,
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "from-violet-500 to-indigo-600",
  staff: "from-[#26C6DA] to-cyan-600",
  patient: "from-emerald-500 to-teal-600",
};

export function RoleLoginPage() {
  const router = useRouter();

  const handleSelect = (role: UserRole) => {
    setStoredRole(role);
    router.push("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F9FB] px-4 py-10 dark:bg-background">
      <div
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: TEAL }}
      />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-indigo-500 opacity-10 blur-3xl" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Activity className="size-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A202C] dark:text-slate-50 sm:text-4xl">
            Welcome to Medi EHR
          </h1>
          <p className="mt-3 text-base text-[#718096] dark:text-muted-foreground">
            Choose how you want to sign in. No password required.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ROLE_OPTIONS.map((option) => {
            const Icon = ROLE_ICONS[option.id];
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "group flex flex-col rounded-2xl border border-[#E8ECF0] bg-white p-6 text-left shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all",
                  "hover:-translate-y-1 hover:border-transparent hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26C6DA] focus-visible:ring-offset-2",
                  "dark:border-border dark:bg-card dark:hover:shadow-lg",
                )}
              >
                <div
                  className={cn(
                    "mb-5 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105",
                    ROLE_COLORS[option.id],
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <h2 className="text-lg font-bold text-[#1A202C] dark:text-slate-50">
                  {option.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#718096] dark:text-muted-foreground">
                  {option.description}
                </p>
                <span
                  className="mt-5 text-sm font-semibold transition-colors group-hover:opacity-80"
                  style={{ color: TEAL }}
                >
                  Continue as {option.title.split(" / ")[0]} →
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-[#A0AEC0]">
          Demo access only — select a role to explore the dashboard.
        </p>
      </div>
    </main>
  );
}
