import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Eye, EyeOff, Loader2, Lock } from "lucide-react";

import { AuthCard } from "@/components/Authcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, resetPassword } from "@/services/auth";

/** Mesma regra do cadastro: 8+ caracteres, com ao menos uma letra e um número. */
function validatePassword(password: string): string | null {
  if (password.length < 8) return "A senha deve ter ao menos 8 caracteres.";
  if (!/[A-Za-z]/.test(password)) return "Inclua ao menos uma letra.";
  if (!/\d/.test(password)) return "Inclua ao menos um número.";
  return null;
}

type FormErrors = { password?: string; confirm?: string };

export function ResetPasswordPage({ token }: { token: string | undefined }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const mutation = useMutation({
    mutationFn: (newPassword: string) => resetPassword(token ?? "", newPassword),
    onError: (error) => {
      const passwordError = error instanceof ApiError ? error.fieldErrors["password"] : undefined;
      if (passwordError) setErrors({ password: passwordError });
    },
  });

  if (!token) {
    return (
      <AuthCard title="Link inválido">
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Este link de recuperação está incompleto ou expirou. Peça um novo para continuar.
          </p>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Pedir novo link</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (mutation.isSuccess) {
    return (
      <AuthCard title="Senha alterada">
        <div className="space-y-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <p role="status" className="text-sm leading-relaxed text-muted-foreground">
            Pronto! Sua senha foi atualizada. Entre com a nova senha.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Ir para o login</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: FormErrors = {};
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (password !== confirm) next.confirm = "As senhas não são iguais.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    mutation.mutate(password);
  }

  // Erro sem campo específico (token expirado, rede fora do ar...).
  const formError =
    mutation.error && !errors.password
      ? mutation.error instanceof ApiError
        ? mutation.error.message
        : "Não foi possível alterar a senha. Tente novamente."
      : null;

  const toggle = (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Ocultar senhas" : "Mostrar senhas"}
      aria-pressed={showPassword}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {showPassword ? (
        <EyeOff className="size-4" aria-hidden="true" />
      ) : (
        <Eye className="size-4" aria-hidden="true" />
      )}
    </button>
  );

  return (
    <AuthCard title="Criar nova senha" subtitle="Escolha uma senha que você ainda não usou aqui.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={mutation.isPending}
              aria-invalid={!!errors.password}
              aria-describedby="password-hint password-error"
              className="px-9"
            />
            {toggle}
          </div>
          <p id="password-hint" className="text-xs text-muted-foreground">
            Pelo menos 8 caracteres, com letras e números.
          </p>
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

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar nova senha</Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="confirm"
              name="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={mutation.isPending}
              aria-invalid={!!errors.confirm}
              aria-describedby={errors.confirm ? "confirm-error" : undefined}
              className="pl-9"
            />
          </div>
          {errors.confirm && (
            <p
              id="confirm-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.confirm}
            </p>
          )}
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

        <Button type="submit" disabled={mutation.isPending} className="w-full gap-2 font-semibold">
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar nova senha"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
