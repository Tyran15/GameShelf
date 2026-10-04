import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Botão "Exibir mais" que abre um modal com a lista completa de um card.
 * O cabeçalho do modal fica fixo e apenas o conteúdo rola quando é muito grande.
 */
export function StatsDetailsDialog({
  title,
  description,
  triggerLabel = "Exibir mais",
  triggerClassName,
  children,
}: {
  title: string;
  description: string;
  triggerLabel?: string;
  triggerClassName?: string | undefined;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("w-full", triggerClassName)}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-xl">
        <DialogHeader className="pr-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
