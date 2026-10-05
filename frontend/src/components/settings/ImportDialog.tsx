import { useMemo, useState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useGames } from "@/hooks/useGames";
import { useGenres } from "@/hooks/useGenres";
import { useImportLibrary } from "@/hooks/useImportLibrary";
import { usePlatforms } from "@/hooks/usePlatforms";
import { buildImportPlan, type ParsedImportFile } from "@/lib/importLibrary";

const MAX_LISTED_ISSUES = 50;

export interface PendingImport extends ParsedImportFile {
  fileName: string;
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function IssueList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  const shown = items.slice(0, MAX_LISTED_ISSUES);
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-sm font-medium text-warning">
        <TriangleAlert className="size-4" />
        {title}
      </p>
      <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        {shown.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
        {items.length > shown.length ? (
          <li className="font-medium">… e mais {items.length - shown.length}.</li>
        ) : null}
      </ul>
    </div>
  );
}

export function ImportDialog({ file, onClose }: { file: PendingImport; onClose: () => void }) {
  const games = useGames({});
  const platforms = usePlatforms();
  const genres = useGenres();
  const { mutation, progress } = useImportLibrary();
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const gamesData = games.data;
  const platformsData = platforms.data;
  const genresData = genres.data;
  const isLoadingExisting = games.isPending || platforms.isPending || genres.isPending;
  const hasLoadError = games.isError || platforms.isError || genres.isError;

  const plan = useMemo(
    () =>
      gamesData && platformsData && genresData
        ? buildImportPlan(
            file.games,
            { games: gamesData, platforms: platformsData, genres: genresData },
            { skipDuplicates },
          )
        : null,
    [file.games, gamesData, platformsData, genresData, skipDuplicates],
  );

  const isRunning = mutation.isPending;
  const result = mutation.data;
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);

  async function handleImport() {
    if (!plan || !platformsData || !genresData) return;
    try {
      const outcome = await mutation.mutateAsync({
        plan,
        existing: { platforms: platformsData, genres: genresData },
      });
      if (outcome.failures.length === 0) {
        toast.success(`${plural(outcome.created, "jogo importado", "jogos importados")}.`);
      } else if (outcome.created > 0) {
        toast.warning(
          `${plural(outcome.created, "jogo importado", "jogos importados")}; ${outcome.failures.length} falharam.`,
        );
      } else {
        toast.error("Nenhum jogo foi importado.");
      }
    } catch {
      toast.error("A importação foi interrompida. Confira a biblioteca e tente novamente.");
    }
  }

  const rowIssues = file.errors.map((error) => `Linha ${error.line}: ${error.message}`);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        // Enquanto importa, o diálogo não pode ser fechado para não esconder o andamento.
        if (!open && !isRunning) onClose();
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-xl">
        <DialogHeader className="pr-6">
          <DialogTitle>{result ? "Importação concluída" : "Importar biblioteca"}</DialogTitle>
          <DialogDescription className="break-all">
            {file.fileName} · {file.format.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {result ? (
            <>
              <p className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4 text-success" />
                {plural(result.created, "jogo importado", "jogos importados")}
                {result.failures.length > 0 ? `, ${result.failures.length} com falha` : "."}
              </p>
              <IssueList
                title="Não foi possível importar"
                items={result.failures.map((f) => `${f.title}: ${f.message}`)}
              />
            </>
          ) : isRunning ? (
            <div className="space-y-2">
              <Progress value={percent} aria-label="Progresso da importação" />
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Importando {progress.done} de {progress.total}…
              </p>
            </div>
          ) : hasLoadError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar a biblioteca atual para comparar. Feche e tente de novo.
            </p>
          ) : isLoadingExisting || !plan ? (
            <p className="text-sm text-muted-foreground">Analisando o arquivo…</p>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-card p-3">
                  <dt className="text-xs text-muted-foreground">Prontos para importar</dt>
                  <dd className="font-display text-2xl font-bold">{plan.toImport.length}</dd>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <dt className="text-xs text-muted-foreground">Com problema</dt>
                  <dd className="font-display text-2xl font-bold">{file.errors.length}</dd>
                </div>
              </dl>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-3">
                <div className="min-w-0">
                  <Label htmlFor="skip-duplicates" className="text-sm font-medium">
                    Ignorar jogos que já existem
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mesmo título na mesma plataforma.
                    {skipDuplicates
                      ? ` ${plural(plan.duplicates.length, "jogo será ignorado", "jogos serão ignorados")}.`
                      : " Eles serão importados mesmo assim."}
                  </p>
                </div>
                <Switch
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onCheckedChange={setSkipDuplicates}
                />
              </div>

              {plan.newPlatforms.length > 0 || plan.newGenres.length > 0 ? (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {plan.newPlatforms.length > 0 ? (
                    <p>
                      <span className="font-medium text-foreground">
                        {plural(plan.newPlatforms.length, "plataforma nova", "plataformas novas")}:
                      </span>{" "}
                      {plan.newPlatforms.join(", ")}
                    </p>
                  ) : null}
                  {plan.newGenres.length > 0 ? (
                    <p>
                      <span className="font-medium text-foreground">
                        {plural(plan.newGenres.length, "gênero novo", "gêneros novos")}:
                      </span>{" "}
                      {plan.newGenres.join(", ")}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <IssueList title="Linhas que serão puladas" items={rowIssues} />
            </>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={onClose}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={isRunning}>
                Cancelar
              </Button>
              <Button
                onClick={() => void handleImport()}
                disabled={isRunning || !plan || plan.toImport.length === 0}
              >
                {isRunning
                  ? "Importando…"
                  : plan
                    ? `Importar ${plural(plan.toImport.length, "jogo", "jogos")}`
                    : "Importar"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
