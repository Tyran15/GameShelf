import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Gamepad2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlatformForm } from "@/components/PlatformForm";
import { ErrorState } from "@/components/ErrorState";
import {
  useCreatePlatform,
  useDeletePlatform,
  usePlatforms,
  useUpdatePlatform,
} from "@/hooks/usePlatforms";
import { ApiError } from "@/services/api";
import type { Platform } from "@/types/platform";

export function PlatformsPage() {
  const platforms = usePlatforms();
  const createPlatform = useCreatePlatform();
  const updatePlatform = useUpdatePlatform();
  const deletePlatform = useDeletePlatform();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Platform | undefined>();
  const [deleting, setDeleting] = useState<Platform | undefined>();

  const isSaving = createPlatform.isPending || updatePlatform.isPending;
  const saveError = editing ? updatePlatform.error : createPlatform.error;

  function openCreate() {
    setEditing(undefined);
    createPlatform.reset();
    setFormOpen(true);
  }

  function openEdit(platform: Platform) {
    setEditing(platform);
    updatePlatform.reset();
    setFormOpen(true);
  }

  function handleSubmit(data: { name: string }) {
    if (editing) {
      updatePlatform.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => {
            toast.success("Plataforma atualizada com sucesso!");
            setFormOpen(false);
          },
          onError: (error) =>
            toast.error(
              error instanceof Error ? error.message : "Não foi possível atualizar a plataforma.",
            ),
        },
      );
      return;
    }

    createPlatform.mutate(data, {
      onSuccess: () => {
        toast.success("Plataforma cadastrada com sucesso!");
        setFormOpen(false);
      },
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Não foi possível cadastrar a plataforma.",
        ),
    });
  }

  function handleDelete() {
    if (!deleting) return;

    deletePlatform.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Plataforma excluída com sucesso!");
        setDeleting(undefined);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível excluir a plataforma.",
        );
        setDeleting(undefined);
      },
    });
  }

  return (
    <div className="page-shell max-w-3xl space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para a biblioteca
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plataformas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as plataformas disponíveis para cadastrar seus jogos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nova plataforma
        </Button>
      </div>

      {platforms.isPending ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          Carregando plataformas...
        </div>
      ) : platforms.isError ? (
        <ErrorState error={platforms.error} onRetry={() => platforms.refetch()} />
      ) : platforms.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface p-10 text-center">
          <Gamepad2 className="size-9 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Nenhuma plataforma cadastrada</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cadastre a primeira plataforma para poder associá-la aos seus jogos.
          </p>
          <Button className="mt-2" onClick={openCreate}>
            Nova plataforma
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.data.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell className="font-medium">{platform.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${platform.name}`}
                        onClick={() => openEdit(platform)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${platform.name}`}
                        onClick={() => setDeleting(platform)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar plataforma" : "Nova plataforma"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Altere o nome da plataforma."
                : "Cadastre uma nova plataforma para associar aos seus jogos."}
            </DialogDescription>
          </DialogHeader>
          <PlatformForm
            platform={editing}
            submitLabel={editing ? "Salvar alterações" : "Cadastrar"}
            isSubmitting={isSaving}
            fieldErrors={saveError instanceof ApiError ? saveError.errors : undefined}
            onCancel={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plataforma?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleting?.name}</strong>? Essa ação não pode
              ser desfeita. Se houver jogos associados a esta plataforma, a exclusão será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePlatform.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePlatform.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}