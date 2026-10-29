import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

/** Moldura das telas públicas de recuperação de senha (mesmo visual do card de login). */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[400px]">
        <Link to="/login" className="mb-5 flex items-center justify-center gap-2">
          <Logo className="size-8" />
          <span className="font-display text-xl font-bold tracking-tight">
            Game<span className="text-primary">Shelf</span>
          </span>
        </Link>

        <div className="animate-fade-up relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div aria-hidden="true" className="bg-gradient-brand absolute inset-x-0 top-0 h-1" />

          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
