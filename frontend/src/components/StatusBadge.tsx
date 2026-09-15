import { GAME_STATUS_LABELS, type GameStatus } from "@/types/game";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<GameStatus, string> = {
  WISHLIST: "bg-info/15 text-info border-info/30",
  PLAYING: "bg-primary/15 text-primary border-primary/30",
  COMPLETED: "bg-success/15 text-success border-success/30",
  PAUSED: "bg-warning/15 text-warning border-warning/30",
  DROPPED: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: GameStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {GAME_STATUS_LABELS[status]}
    </span>
  );
}
