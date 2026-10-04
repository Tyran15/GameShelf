import { useState, type FormEvent } from "react";
import { ExternalLink, Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKeys } from "@/hooks/useApiKeys";
import {
  API_KEY_PROVIDERS,
  API_KEY_PROVIDER_INFO,
  maskApiKey,
  validateApiKey,
  type ApiKeyProvider,
} from "@/lib/apiKeys";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./SettingsSection";

function ApiKeyField({ provider }: { provider: ApiKeyProvider }) {
  const info = API_KEY_PROVIDER_INFO[provider];
  const { keys, save, remove } = useApiKeys();
  const savedKey = keys[provider];
  const isConfigured = savedKey !== "";

  const [draft, setDraft] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputId = `api-key-${provider}`;
  const errorId = `${inputId}-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateApiKey(draft);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    save(provider, result.value);
    setDraft("");
    setVisible(false);
    setError(null);
    toast.success(`Chave do ${info.name} salva.`);
  }

  function handleRemove() {
    remove(provider);
    setDraft("");
    setError(null);
    toast.success(`Chave do ${info.name} removida.`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
      noValidate
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Label htmlFor={inputId} className="text-sm font-semibold">
            {info.name}
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{info.description}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            isConfigured ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          {isConfigured ? `Configurada · ${maskApiKey(savedKey)}` : "Não configurada"}
        </span>
      </div>

      <div className="relative">
        <Input
          id={inputId}
          type={visible ? "text" : "password"}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
          placeholder={isConfigured ? "Cole uma nova chave para substituir" : "Cole sua chave aqui"}
          autoComplete="new-password"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          className="pr-10 font-mono"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar chave digitada" : "Mostrar chave digitada"}
          aria-pressed={visible}
          className="absolute right-0 top-0 size-9 text-muted-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href={info.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
        >
          Como obter a chave
          <ExternalLink className="size-3" />
        </a>
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              Remover
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={draft.trim() === ""}>
            Salvar chave
          </Button>
        </div>
      </div>
    </form>
  );
}

export function ApiKeysSection({ index }: { index: number }) {
  return (
    <SettingsSection
      id="integracoes"
      icon={KeyRound}
      title="Integrações"
      description="Chaves de API do RAWG e do SteamGridDB para dados e capas dos jogos."
      index={index}
    >
      <div className="space-y-4">
        {API_KEY_PROVIDERS.map((provider) => (
          <ApiKeyField key={provider} provider={provider} />
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          As chaves ficam salvas só neste navegador, sem passar pelo servidor do GameShelf, e a
          chave completa não é exibida depois de salva. Qualquer script executado nesta página
          consegue lê-las, então use apenas chaves pessoais e gratuitas. Por enquanto elas só ficam
          guardadas: serão usadas quando a busca automática de capas e dados for ativada.
        </p>
      </div>
    </SettingsSection>
  );
}
