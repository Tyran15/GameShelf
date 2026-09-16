import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Platform, PlatformInput } from "@/types/platform";

export function PlatformForm({
  platform,
  submitLabel,
  isSubmitting,
  fieldErrors,
  onSubmit,
  onCancel,
}: {
  platform?: Platform | undefined;
  submitLabel: string;
  isSubmitting: boolean;
  fieldErrors?: Record<string, string[]> | undefined;
  onSubmit: (data: PlatformInput) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(platform?.name ?? "");
  const [localError, setLocalError] = useState<string | undefined>();

  const errorMessage = localError ?? fieldErrors?.["name"]?.[0];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Informe o nome da plataforma.");
      return;
    }

    setLocalError(undefined);
    onSubmit({ name: trimmed });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform-name">Nome</Label>
        <Input
          id="platform-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setLocalError(undefined);
          }}
          placeholder="Ex: PlayStation 5"
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