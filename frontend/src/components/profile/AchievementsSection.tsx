import { Award, Clapperboard, Layers, Lock, Package, PenLine, Rocket, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Achievement, AchievementId } from "@/lib/profile";

const ICONS: Record<AchievementId, LucideIcon> = {
  "first-game": Rocket,
  finisher: Award,
  critic: PenLine,
  marathon: Zap,
  collector: Package,
  eclectic: Layers,
  multiplatform: Clapperboard,
};

function AchievementBadge({ achievement, index }: { achievement: Achievement; index: number }) {
  const Icon = ICONS[achievement.id];
  const { unlocked, current, target } = achievement;

  return (
    <li
      className={cn(
        "animate-fade-up flex flex-col items-center gap-3 rounded-xl p-4 text-center transition-colors",
        unlocked ? "bg-secondary hover:bg-accent" : "border border-dashed border-border",
      )}
      style={staggerDelay(index)}
    >
      <div
        className={cn(
          "relative flex size-12 items-center justify-center rounded-full",
          unlocked ? "bg-primary/15 text-primary shadow-glow" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
        {!unlocked && (
          <span className="absolute -bottom-1 -right-1 rounded-full bg-card p-0.5">
            <Lock className="size-3.5" aria-label="Bloqueada" />
          </span>
        )}
      </div>

      <div className="w-full min-w-0">
        <p className="truncate text-sm font-semibold">{achievement.title}</p>
        {unlocked ? (
          <p className="text-xs text-success">{achievement.requirement}</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {current} / {target}
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={target}
              aria-valuenow={current}
              aria-label={`Progresso de ${achievement.title}`}
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(current / target) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Award className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Conquistas da estante</h2>
            <p className="text-xs text-muted-foreground">
              Desbloqueadas conforme sua coleção cresce
            </p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          {unlockedCount} de {achievements.length} concluídas
        </span>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {achievements.map((achievement, index) => (
          <AchievementBadge key={achievement.id} achievement={achievement} index={index} />
        ))}
      </ul>
    </section>
  );
}
