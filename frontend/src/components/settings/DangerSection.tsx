import { useState } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteAllGames, useGames } from "@/hooks/useGames";
import { SettingsSection } from "./SettingsSection";

const CONFIRMATION_WORD = "EXCLUIR";

function pluralizeGames(count: number) {
  return `${count} ${count === 1 ? "jogo" : "jogos"}`;
}

export function DangerSection({ index }: { index: number }) {
  const games = useGames({});
  const deleteAll = useDeleteAllGames();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const count = games.data?.length ?? 0;
  const canConfirm = confirmation === CONFIRMATION_WORD && !deleteAll.isPending;

  function handleOpenChange(next: boolean) {
    // Enquanto exclui, o diálogo não pode ser fechado para não esconder o andamento.
    if (deleteAll.isPending) return;
    setOpen(next);
    if (!next) setConfirmation("");
  }

  async function handleDelete() {
    const ids = (games.data ?? []).map((game) => game.id);
    try {
      const { deleted, failed } = await deleteAll.mutateAsync(ids);
      if (failed > 0) {
        toast.error(
          `${pluralizeGames(deleted)} excluídos, mas ${pluralizeGames(failed)} não puderam ser removidos. Tente novamente.`,
        );
      } else {
        toast.success(`${pluralizeGames(deleted)} excluídos.`);
      }
    } catch {
      toast.error("Não foi possível excluir os jogos. Tente novamente.");
    } finally {
      setOpen(false);
      setConfirmation("");
    }
  }

  return (
    <SettingsSection
      id="zona-de-perigo"
      icon={TriangleAlert}
      title="Zona de perigo"
      description="Ações irreversíveis. Exporte um backup antes de continuar."
      index={index}
      tone="danger"
    >
      <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">Excluir todos os jogos</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Remove permanentemente todos os jogos da biblioteca. Plataformas e gêneros são mantidos.
          </p>
        </div>

        <AlertDialog open={open} onOpenChange={handleOpenChange}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={games.isPending || count === 0}>
              <Trash2 className="size-4" />
              Excluir tudo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir todos os jogos?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso apaga {pluralizeGames(count)} de forma permanente e não pode ser desfeito.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm">
                Digite <strong>{CONFIRMATION_WORD}</strong> para confirmar
              </Label>
              <Input
                id="delete-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                disabled={deleteAll.isPending}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteAll.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={!canConfirm}
                className={buttonVariants({ variant: "destructive" })}
                onClick={(event) => {
                  // Mantém o diálogo aberto até a exclusão terminar.
                  event.preventDefault();
                  void handleDelete();
                }}
              >
                {deleteAll.isPending ? "Excluindo…" : "Excluir tudo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SettingsSection>
  );
}
