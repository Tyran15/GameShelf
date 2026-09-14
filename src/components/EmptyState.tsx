import { Link } from "@tanstack/react-router";
import { LibraryBig } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  showAction = true,
}: {
  title: string;
  description: string;
  showAction?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface p-10 text-center">
      <LibraryBig className="size-9 text-muted-foreground" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {showAction ? (
        <Button asChild className="mt-2">
          <Link to="/games/new">Cadastrar jogo</Link>
        </Button>
      ) : null}
    </div>
  );
}
