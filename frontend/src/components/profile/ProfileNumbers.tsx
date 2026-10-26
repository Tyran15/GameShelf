import { CheckCircle2, LayoutGrid, MessageSquareText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent, formatRating, type LibrarySummary } from "@/lib/libraryStats";

const TONES = {
  primary: { box: "bg-primary/15 text-primary", value: "" },
  success: { box: "bg-success/15 text-success", value: "text-success" },
  warning: { box: "bg-warning/15 text-warning", value: "text-warning" },
} as const;

function NumberCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  index,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  index: number;
}) {
  return (
    <div
      className="animate-fade-up flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5"
      style={staggerDelay(index)}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-1 font-display text-4xl font-bold leading-none", TONES[tone].value)}>
          {value}
        </p>
        <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-xl",
          TONES[tone].box,
        )}
      >
        <Icon className="size-7" aria-hidden="true" />
      </span>
    </div>
  );
}

export function ProfileNumbers({ summary }: { summary: LibrarySummary }) {
  return (
    <section aria-label="Números da biblioteca" className="grid gap-4 md:grid-cols-3">
      <NumberCard
        index={1}
        label="Jogos na biblioteca"
        value={<AnimatedNumber value={summary.totalGames} format={formatNumber} />}
        hint={
          summary.addedThisMonth > 0
            ? `+${summary.addedThisMonth} adicionados este mês`
            : "nenhum adicionado este mês"
        }
        icon={LayoutGrid}
        tone="primary"
      />
      <NumberCard
        index={2}
        label="Jogos zerados"
        value={<AnimatedNumber value={summary.completedGames} format={formatNumber} />}
        hint={`Taxa de conclusão: ${formatPercent(summary.completionRate)}`}
        icon={CheckCircle2}
        tone="success"
      />
      <NumberCard
        index={3}
        label="Jogos avaliados"
        value={<AnimatedNumber value={summary.ratedGames} format={formatNumber} />}
        hint={
          summary.averageRating === null
            ? "nenhuma nota ainda"
            : `Nota média: ${formatRating(summary.averageRating)}`
        }
        icon={MessageSquareText}
        tone="warning"
      />
    </section>
  );
}
