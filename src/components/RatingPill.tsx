import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingPill({
  rating,
  className,
}: {
  rating: number | null;
  className?: string;
}) {
  if (rating === null || rating === undefined) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Sem nota
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground",
        className,
      )}
    >
      <Star className="size-3 fill-primary text-primary" />
      {rating.toFixed(1)}
    </span>
  );
}
