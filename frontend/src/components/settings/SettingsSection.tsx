import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  index = 0,
  tone = "default",
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Posição na cascata de entrada da página. */
  index?: number;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const isDanger = tone === "danger";

  return (
    <section
      id={id}
      className={cn(
        "animate-fade-up scroll-mt-24 rounded-2xl border bg-surface p-5",
        isDanger ? "border-destructive/40" : "border-border",
      )}
      style={staggerDelay(index)}
    >
      <div className="mb-5 flex items-start gap-3">
        <Icon
          className={cn("mt-0.5 size-5 shrink-0", isDanger ? "text-destructive" : "text-primary")}
        />
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
