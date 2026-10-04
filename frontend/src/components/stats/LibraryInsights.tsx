import { CheckCircle2, Clock, Hourglass, Monitor, Sparkles, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  formatHours,
  formatPercent,
  type CountEntry,
  type LibrarySummary,
} from "@/lib/libraryStats";
import { StatsSection } from "./StatsSection";

interface Insight {
  key: string;
  title: string;
  icon: LucideIcon;
  tone: string;
  text: ReactNode;
}

const strong = (content: ReactNode) => (
  <strong className="font-semibold text-foreground">{content}</strong>
);

export function LibraryInsights({
  summary,
  topPlatform,
  topGenre,
  index = 0,
}: {
  summary: LibrarySummary;
  /** Omitido quando a página está filtrada por uma única plataforma. */
  topPlatform: CountEntry | null;
  topGenre: CountEntry | null;
  index?: number;
}) {
  const insights: Insight[] = [
    {
      key: "completion",
      title: "Taxa de conclusão",
      icon: CheckCircle2,
      tone: "text-success",
      text: (
        <>
          Você zerou {strong(formatPercent(summary.completionRate))} da biblioteca (
          {summary.completedGames} de {summary.totalGames}{" "}
          {summary.totalGames === 1 ? "jogo" : "jogos"}).
        </>
      ),
    },
  ];

  if (topPlatform) {
    insights.push({
      key: "platform",
      title: "Plataforma predominante",
      icon: Monitor,
      tone: "text-primary",
      text: (
        <>
          {strong(topPlatform.name)} concentra {strong(formatPercent(topPlatform.percent))} dos
          jogos ({topPlatform.count}).
        </>
      ),
    });
  }

  if (topGenre) {
    insights.push({
      key: "genre",
      title: "Gênero mais presente",
      icon: Tag,
      tone: "text-violet",
      text: (
        <>
          {strong(topGenre.name)} aparece em {strong(formatPercent(topGenre.percent))} da biblioteca
          ({topGenre.count}).
        </>
      ),
    });
  }

  insights.push(
    {
      key: "backlog",
      title: "Backlog",
      icon: Hourglass,
      tone: "text-warning",
      text: (
        <>
          {strong(`${summary.backlogGames} ${summary.backlogGames === 1 ? "jogo" : "jogos"}`)} entre
          lista de desejos e pausados.
        </>
      ),
    },
    {
      key: "hours",
      title: "Tempo registrado",
      icon: Clock,
      tone: "text-primary",
      text:
        summary.gamesWithHours > 0 ? (
          <>
            {strong(formatHours(summary.totalHours))} em {summary.gamesWithHours}{" "}
            {summary.gamesWithHours === 1 ? "jogo" : "jogos"}, média de{" "}
            {strong(formatHours(summary.totalHours / summary.gamesWithHours))} por jogo.
          </>
        ) : (
          "Nenhuma hora registrada ainda."
        ),
    },
  );

  return (
    <StatsSection icon={Sparkles} title="Insights da biblioteca" index={index}>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
        {insights.map((insight) => (
          <div key={insight.key} className="flex gap-3 rounded-xl bg-secondary/60 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/60">
              <insight.icon className={cn("size-4", insight.tone)} />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "mb-0.5 text-[11px] font-semibold uppercase tracking-wide",
                  insight.tone,
                )}
              >
                {insight.title}
              </p>
              <p className="text-sm text-muted-foreground">{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
    </StatsSection>
  );
}
