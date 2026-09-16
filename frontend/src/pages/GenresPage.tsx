import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus, Tags, Trash2 } from "lucide-react";
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
import { GenreForm } from "@/components/GenreForm";
import { ErrorState } from "@/components/ErrorState";
import { useCreateGenre, useDeleteGenre, useGenres, useUpdateGenre } from "@/hooks/useGenres";
import { ApiError } from "@/services/api";
import type { Genre } from "@/types/genre";

export function GenresPage() {
  const genres = useGenres();
  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const deleteGenre = useDeleteGenre();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Genre | undefined>();
  const [deleting, setDeleting] = useState<Genre | undefined>();

  const isSaving = createGenre.isPending || updateGenre.isPending;
  const saveError = editing ? updateGenre.error : createGenre.error;

  function openCreate() {
    setEditing(undefined);
    createGenre.reset();
    setFormOpen(true);
  }

  function openEdit(genre: Genre) {
    setEditing(genre);
    updateGenre.reset();
    setFormOpen(true);
  }

  function handleSubmit(data: { name: string }) {
    if (editing) {
      updateGenre.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => {
            toast.success("Gênero atualizado com sucesso!");
            setFormOpen(false);
          },
          onError: (error) =>
            toast.error(
              error instanceof Error ? error.message : "Não foi possível atualizar o gênero.",
            ),
        },
      );
      return;
    }

    createGenre.mutate(data, {
      onSuccess: () => {
        toast.success("Gênero cadastrado com sucesso!");
        setFormOpen(false);
      },
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Não foi possível cadastrar o gênero.",
        ),
    });
  }

  function handleDelete() {
    if (!deleting) return;

    deleteGenre.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Gênero excluído com sucesso!");
        setDeleting(undefined);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Não foi possível excluir o gênero.");
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
          <h1 className="text-3xl font-bold">Gêneros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os gêneros disponíveis para cadastrar seus jogos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Novo gênero
        </Button>
      </div>

      {genres.isPending ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          Carregando gêneros...
        </div>
      ) : genres.isError ? (
        <ErrorState error={genres.error} onRetry={() => genres.refetch()} />
      ) : genres.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface p-10 text-center">
          <Tags className="size-9 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Nenhum gênero cadastrado</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cadastre o primeiro gênero para poder associá-lo aos seus jogos.
          </p>
          <Button className="mt-2" onClick={openCreate}>
            Novo gênero
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
              {genres.data.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell className="font-medium">{genre.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${genre.name}`}
                        onClick={() => openEdit(genre)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${genre.name}`}
                        onClick={() => setDeleting(genre)}
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
            <DialogTitle>{editing ? "Editar gênero" : "Novo gênero"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Altere o nome do gênero."
                : "Cadastre um novo gênero para associar aos seus jogos."}
            </DialogDescription>
          </DialogHeader>
          <GenreForm
            genre={editing}
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
            <AlertDialogTitle>Excluir gênero?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleting?.name}</strong>? Essa ação não pode
              ser desfeita. Se houver jogos associados a este gênero, a exclusão será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteGenre.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteGenre.isPending}
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