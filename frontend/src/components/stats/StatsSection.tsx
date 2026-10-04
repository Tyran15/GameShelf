import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function StatsSection({
  icon: Icon,
  title,
  aside,
  className,
  index = 0,
  children,
}: {
  icon: LucideIcon;
  title: string;
  aside?: ReactNode;
  className?: string | undefined;
  /** Posição na cascata de entrada da página. */
  index?: number;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "animate-fade-up min-w-0 rounded-2xl border border-border bg-surface p-5",
        className,
      )}
      style={staggerDelay(index)}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-5 shrink-0 text-primary" />
          <h2 className="truncate text-base font-semibold">{title}</h2>
        </div>
        {aside ? <div className="text-xs text-muted-foreground">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function SectionEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
