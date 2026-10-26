import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { History, PlusCircle, Trophy } from "lucide-react";
import { formatRelative, type ActivityEvent, type ActivityKind } from "@/lib/profile";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Filter = "all" | ActivityKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "completed", label: "Zerados" },
  { value: "added", label: "Adicionados" },
];

const KIND = {
  added: { icon: PlusCircle, verb: "Adicionou", tone: "text-primary border-primary" },
  completed: { icon: Trophy, verb: "Zerou", tone: "text-success border-success" },
} as const;

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? events : events.filter((event) => event.kind === filter);

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <History className="size-6 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Atividade recente</h2>
            <p className="text-xs text-muted-foreground">O que mudou na sua biblioteca</p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filtrar atividade"
          className="flex self-start rounded-lg bg-secondary p-1 sm:self-auto"
        >
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === item.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
          Nenhuma atividade nesta categoria ainda.
        </p>
      ) : (
        <ol className="relative flex flex-col gap-3 pl-7 before:absolute before:bottom-3 before:left-[0.6rem] before:top-3 before:w-0.5 before:bg-border">
          {visible.map((event, index) => {
            const { icon: Icon, verb, tone } = KIND[event.kind];
            return (
              <li
                key={event.id}
                className="animate-fade-up relative flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
                style={staggerDelay(index)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[1.62rem] top-5 size-3 rounded-full border-2 bg-background",
                    tone,
                  )}
                />
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary",
                    tone.split(" ")[0],
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="text-muted-foreground">{verb} </span>
                    <Link
                      to="/games/$id"
                      params={{ id: String(event.game.id) }}
                      className="font-semibold hover:text-primary"
                    >
                      {event.game.title}
                    </Link>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {event.game.platform.name} · {event.game.genre.name}
                  </p>
                </div>

                <time dateTime={event.date} className="shrink-0 text-xs text-muted-foreground">
                  {formatRelative(event.date)}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
