import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Genre, GenreInput } from "@/types/genre";

export function GenreForm({
  genre,
  submitLabel,
  isSubmitting,
  fieldErrors,
  onSubmit,
  onCancel,
}: {
  genre?: Genre | undefined;
  submitLabel: string;
  isSubmitting: boolean;
  fieldErrors?: Record<string, string[]> | undefined;
  onSubmit: (data: GenreInput) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(genre?.name ?? "");
  const [localError, setLocalError] = useState<string | undefined>();

  const errorMessage = localError ?? fieldErrors?.["name"]?.[0];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Informe o nome do gênero.");
      return;
    }

    setLocalError(undefined);
    onSubmit({ name: trimmed });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="genre-name">Nome</Label>
        <Input
          id="genre-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setLocalError(undefined);
          }}
          placeholder="Ex: RPG"
          autoFocus
        />
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}