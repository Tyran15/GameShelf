import { Braces, Database, Table2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGames } from "@/hooks/useGames";
import { downloadTextFile, exportFilename, gamesToCsv, gamesToJson } from "@/lib/exportLibrary";
import { SettingsSection } from "./SettingsSection";

function ExportCard({
  icon: Icon,
  title,
  description,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold group-enabled:group-hover:text-primary">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

export function DataSection({ index }: { index: number }) {
  // Mesma query ({}) da Biblioteca e das Estatísticas: vem do cache do React Query.
  const games = useGames({});
  const list = games.data ?? [];
  const isEmpty = list.length === 0;

  function exportAs(format: "csv" | "json") {
    if (isEmpty) return;
    if (format === "csv") {
      downloadTextFile(exportFilename("csv"), gamesToCsv(list), "text/csv;charset=utf-8");
    } else {
      downloadTextFile(exportFilename("json"), gamesToJson(list), "application/json");
    }
    toast.success(`Biblioteca exportada (${list.length} ${list.length === 1 ? "jogo" : "jogos"}).`);
  }

  return (
    <SettingsSection
      id="dados"
      icon={Database}
      title="Dados"
      description="Seus jogos são seus: baixe uma cópia da biblioteca quando quiser."
      index={index}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <ExportCard
          icon={Table2}
          title="Exportar planilha (.csv)"
          description="Título, plataforma, gênero, status, nota, horas e datas. Abre no Excel e no Google Planilhas."
          disabled={isEmpty}
          onClick={() => exportAs("csv")}
        />
        <ExportCard
          icon={Braces}
          title="Backup completo (.json)"
          description="Todos os campos de cada jogo, incluindo descrição e links de capa."
          disabled={isEmpty}
          onClick={() => exportAs("json")}
        />
      </div>

      {games.isPending ? (
        <p className="text-xs text-muted-foreground">Carregando a biblioteca…</p>
      ) : games.isError ? (
        <p className="flex flex-wrap items-center gap-2 text-xs text-destructive">
          Não foi possível carregar a biblioteca para exportar.
          <Button variant="outline" size="sm" onClick={() => games.refetch()}>
            Tentar novamente
          </Button>
        </p>
      ) : isEmpty ? (
        <p className="text-xs text-muted-foreground">
          Sua biblioteca está vazia, então não há o que exportar ainda.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {list.length} {list.length === 1 ? "jogo" : "jogos"} serão incluídos no arquivo.
        </p>
      )}
    </SettingsSection>
  );
}
