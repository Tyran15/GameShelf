import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CircleAlert, Loader2, Mail, MailCheck } from "lucide-react";

import { AuthCard } from "@/components/Authcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, forgotPassword } from "@/services/auth";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const mutation = useMutation({ mutationFn: forgotPassword });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!value) return setFieldError("Informe seu e-mail.");
    if (!EMAIL_REGEX.test(value)) return setFieldError("Digite um e-mail válido.");

    setFieldError(null);
    mutation.mutate(value);
  }

  // A API responde igual exista ou não a conta: a tela também não revela isso.
  if (mutation.isSuccess) {
    return (
      <AuthCard title="Confira seu e-mail">
        <div className="space-y-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <MailCheck className="size-6" aria-hidden="true" />
          </div>
          <p role="status" className="text-sm leading-relaxed text-muted-foreground">
            Se existir uma conta com <strong className="text-foreground">{email.trim()}</strong>,
            enviamos um link para criar uma nova senha. O link vale por 1 hora.
          </p>
          <Button asChild variant="outline" className="w-full gap-2">
            <Link to="/login">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar para o login
            </Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  const apiMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? "Não foi possível enviar o link. Tente novamente."
        : null;

  return (
    <AuthCard
      title="Esqueceu a senha?"
      subtitle="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
              disabled={mutation.isPending}
              aria-invalid={!!fieldError}
              aria-describedby={fieldError ? "email-error" : undefined}
              className="pl-9"
            />
          </div>
          {fieldError && (
            <p
              id="email-error"
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
              {fieldError}
            </p>
          )}
        </div>

        {apiMessage && (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
          >
            <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            {apiMessage}
          </p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full gap-2 font-semibold">
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            "Enviar link de recuperação"
          )}
        </Button>

        <p className="pt-1 text-center text-xs text-muted-foreground">
          Lembrou?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Voltar para o login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
