import { useRef, useState, type ChangeEvent } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import {
  ImportFileError,
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_ROWS,
  parseImportFile,
} from "@/lib/importLibrary";
import { ImportDialog, type PendingImport } from "./ImportDialog";

export function ImportCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // Permite escolher o mesmo arquivo de novo depois.
    input.value = "";
    if (!file) return;

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      toast.error("O arquivo é grande demais (máximo de 2 MB).");
      return;
    }

    try {
      const parsed = parseImportFile(file.name, await file.text());
      setPending({ ...parsed, fileName: file.name });
    } catch (error) {
      toast.error(
        error instanceof ImportFileError ? error.message : "Não foi possível ler o arquivo.",
      );
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void handleFileChange(event)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group flex w-full items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileUp className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold group-hover:text-primary">
            Importar jogos (.csv ou .json)
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Aceita os arquivos exportados pelo GameShelf. Título, plataforma e gênero são
            obrigatórios; plataformas e gêneros que não existirem serão criados. Até{" "}
            {MAX_IMPORT_ROWS} jogos por vez.
          </span>
        </span>
      </button>

      {pending ? <ImportDialog file={pending} onClose={() => setPending(null)} /> : null}
    </>
  );
}
