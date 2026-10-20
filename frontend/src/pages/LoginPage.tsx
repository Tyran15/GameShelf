import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CircleAlert,
  Clock,
  Eye,
  EyeOff,
  Gamepad2,
  Library,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SESSION_QUERY_KEY } from "@/hooks/useSession";
import { ApiError, loginUser } from "@/services/auth";

/* -------------------------------------------------------------------------- */
/*  Subcomponentes visuais                                                    */
/* -------------------------------------------------------------------------- */

type GameCoverProps = {
  title: string;
  genre: string;
  platform: string;
  footer: string;
  tone: string;
  coverUrl?: string;
  progress?: number;
  featured?: boolean;
  className?: string;
};

function GameCover({
  title,
  genre,
  platform,
  footer,
  tone,
  coverUrl,
  progress,
  featured = false,
  className = "",
}: GameCoverProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-2xl border bg-linear-to-br transition-transform duration-300",
        tone,
        featured ? "card-glow-ring z-30 h-72 w-48 border-primary/60" : "h-64 w-44 border-border",
        className,
      ].join(" ")}
    >
      {coverUrl && !imageFailed && (
        <img
          src={coverUrl}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      <span className="absolute left-2.5 top-2.5 rounded-md border border-border bg-background/70 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md">
        {platform}
      </span>

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background via-background/85 to-transparent p-3 pt-12">
        <span className="text-[10px] font-semibold text-primary">{genre}</span>
        <h3
          className={[
            "font-bold leading-tight text-foreground",
            featured ? "text-base" : "truncate text-sm",
          ].join(" ")}
        >
          {title}
        </h3>

        {progress !== undefined ? (
          <>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso em ${title}`}
            >
              <div
                className="bg-gradient-brand h-full rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{footer}</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
          </>
        ) : (
          <p className="mt-1.5 text-[10px] text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}

const statTones = {
  primary: { icon: "border-primary/20 bg-primary/10 text-primary", bar: "bg-primary" },
  success: { icon: "border-success/20 bg-success/10 text-success", bar: "bg-success" },
  warning: { icon: "border-warning/20 bg-warning/10 text-warning", bar: "bg-warning" },
} as const;

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  progress: number;
  tone: keyof typeof statTones;
  icon: ReactNode;
};

function StatCard({ label, value, hint, progress, tone, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-3.5 backdrop-blur-md">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={`flex size-7 items-center justify-center rounded-lg border ${statTones[tone].icon}`}
        >
          {icon}
        </span>
      </div>
      <p className="font-display text-xl font-bold tracking-tight text-foreground">{value}</p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${statTones[tone].bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
        fill="#EA4335"
      />
      <path
        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
        fill="#4285F4"
      />
      <path
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
        fill="#FBBC05"
      />
      <path
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
        fill="#34A853"
      />
    </svg>
  );
}

// NOVO ÍCONE DA STEAM
function SteamIcon() {
  return (
    <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.979 0C5.678 0 .511 4.556 0 10.719c0 .003 0 .004 0 .004l6.444 2.654a3.23 3.23 0 0 1 1.828-.567c.056 0 .111.001.166.004l2.865-4.148v-.057a4.305 4.305 0 1 1 4.305 4.305h-.099l-4.087 2.916c0 .048.002.096.002.145a3.231 3.231 0 0 1-6.43.629L.621 14.673C2.041 20.335 7.491 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm-5.042 15.844l-1.436-.591a2.44 2.44 0 0 0 4.355-1.52 2.44 2.44 0 0 0-4.258-1.598l1.484.61a1.794 1.794 0 1 1-1.358 3.307h-.002l-.002.001-.001-.001.001-.001.002-.002c.122.033.252.05.387.05a1.203 1.203 0 0 0 0-2.406 1.21 1.21 0 0 0-1.172 1.146zm10.77-6.573a2.865 2.865 0 1 0 0-5.73 2.865 2.865 0 0 0 0 5.73zm0-4.72a1.855 1.855 0 1 1 0 3.71 1.855 1.855 0 0 1 0-3.71z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Página                                                                     */
/* -------------------------------------------------------------------------- */

type FormErrors = { email?: string; password?: string };

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      // Já grava o usuário no cache da sessão: o header aparece sem esperar outro /me.
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      navigate({ to: "/" });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const next: FormErrors = {};
        const emailError = error.fieldErrors["email"];
        const passwordError = error.fieldErrors["password"];
        if (emailError) next.email = emailError;
        if (passwordError) next.password = passwordError;
        if (next.email || next.password) {
          setErrors(next);
          return;
        }
        // 401 (credenciais inválidas) e falhas de rede caem aqui.
        setFormError(error.message);
        return;
      }
      setFormError("Não foi possível entrar. Tente novamente.");
    },
  });

  const isLoading = mutation.isPending;

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!email.trim()) next.email = "Informe seu e-mail.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Digite um e-mail válido.";
    if (!password) next.password = "Informe sua senha.";
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutation.mutate({ email: email.trim(), password });
  }

  return (
    <div className="grid flex-1 lg:grid-cols-[55fr_45fr]">
      {/* ===================== Coluna esquerda: vitrine ===================== */}
      <section className="relative flex flex-col justify-start gap-8 overflow-hidden border-b border-border bg-surface p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-violet/20 blur-[120px]"
        />

        {/* Topo: logo + link */}
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="GameShelf Ícone" className="h-6 w-6 object-contain" />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Game<span className="text-primary">Shelf</span>
            </span>
          </div>
        </header>

        {/* Centro: título + capas + estatísticas */}
        <div className="relative z-10 space-y-6 mt-12">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-[42px]">
              Sua biblioteca de jogos, <span className="text-gradient-brand">organizada.</span>
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Cadastre seus jogos, organize por plataforma e gênero e acompanhe o que você já zerou,
              está jogando ou quer jogar.
            </p>
          </div>

          {/* Capas inclinadas em 3D - Centralizadas */}
          <div className="hidden w-full items-center justify-center py-4 [perspective:1200px] lg:flex">
            <div className="flex w-full max-w-lg items-center justify-center -space-x-12">
              <GameCover
                title="Elden Ring"
                genre="Action RPG"
                platform="PC"
                footer="94h jogadas · Zerado"
                tone="from-info/40 via-surface to-background"
                coverUrl="https://cdn2.steamgriddb.com/thumb/557fa68027943a8b0d3b66c4e72ff23b.jpg"
                className="z-10 [transform:rotateY(-18deg)_rotateX(10deg)_rotateZ(5deg)] hover:[transform:rotateY(-10deg)_rotateX(5deg)_rotateZ(2deg)_translateY(-6px)]"
              />
              <GameCover
                featured
                title="Cuphead: The Delicious Last Course"
                genre="Plataforma"
                platform="Switch"
                footer="Mundo 3"
                progress={78}
                tone="from-primary/40 via-violet/25 to-background"
                coverUrl="https://cdn2.steamgriddb.com/thumb/be7ec228d6a8829bfbf708318a1111f3.jpg"
                className="[transform:rotateY(-14deg)_rotateX(7deg)_rotateZ(3deg)] hover:[transform:rotateY(-8deg)_rotateX(4deg)_rotateZ(1deg)_translateY(-8px)]"
              />
              <GameCover
                title="Cyberpunk 2077"
                genre="RPG"
                platform="PS5"
                footer="Phantom Liberty · 100%"
                tone="from-violet/40 via-surface to-background"
                coverUrl="https://cdn2.steamgriddb.com/thumb/055c25fa28c4eb8c6bb0672e557eef80.jpg"
                className="z-20 [transform:rotateY(-10deg)_rotateX(5deg)_rotateZ(1deg)] hover:[transform:rotateY(-4deg)_rotateX(2deg)_translateY(-6px)]"
              />
            </div>
          </div>

          {/* DADOS GLOBAIS */}
          <div className="hidden gap-3 sm:grid sm:grid-cols-3">
            <StatCard
              label="Catálogo global"
              value="12.540 jogos"
              hint="Integração RAWG"
              progress={100}
              tone="primary"
              icon={<Library className="size-3.5" aria-hidden="true" />}
            />
            <StatCard
              label="Horas totais"
              value="850k+ horas"
              hint="Somadas na plataforma"
              progress={75}
              tone="success"
              icon={<Clock className="size-3.5" aria-hidden="true" />}
            />
            <StatCard
              label="Plataformas"
              value="24 suportadas"
              hint="Do retrô ao atual"
              progress={90}
              tone="warning"
              icon={<Gamepad2 className="size-3.5" aria-hidden="true" />}
            />
          </div>
        </div>
      </section>

      {/* ===================== Coluna direita: formulário ==================== */}
      <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[400px]">
          <div className="animate-fade-up relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div aria-hidden="true" className="bg-gradient-brand absolute inset-x-0 top-0 h-1" />

            <div className="mb-6 space-y-1.5">
              <h2 className="text-2xl font-bold">Entrar</h2>
              <p className="text-sm text-muted-foreground">
                Bem-vindo de volta! Acesse sua estante de jogos.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* E-mail */}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="pl-9"
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="flex items-center gap-1 text-xs font-medium text-destructive"
                  >
                    <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="px-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="flex items-center gap-1 text-xs font-medium text-destructive"
                  >
                    <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Lembrar + esqueci a senha */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(value) => setRemember(value === true)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer text-xs font-normal text-muted-foreground"
                  >
                    Lembrar de mim
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-xs font-medium text-primary transition-colors hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
                >
                  <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                  {formError}
                </p>
              )}

              {/* Ação principal */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full gap-2 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" aria-hidden="true" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-card px-2.5 text-xs text-muted-foreground">
                ou continue com
              </span>
            </div>

            {/* Login social */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button type="button" variant="outline" disabled={isLoading} className="gap-2">
                <GoogleIcon />
                Google
              </Button>
              {/* BOTÃO DA STEAM AQUI */}
              <Button type="button" variant="outline" disabled={isLoading} className="gap-2">
                <SteamIcon />
                Steam
              </Button>
            </div>

            <p className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="font-semibold text-primary hover:underline">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>

          <nav
            aria-label="Links institucionais"
            className="mt-5 flex items-center justify-center gap-3 text-xs text-muted-foreground"
          >
            <a href="#" className="hover:underline">
              Termos de uso
            </a>
            <span aria-hidden="true">•</span>
            <a href="#" className="hover:underline">
              Privacidade
            </a>
            <span aria-hidden="true">•</span>
            <a href="#" className="hover:underline">
              Suporte
            </a>
          </nav>
        </div>
      </section>
    </div>
  );
}
