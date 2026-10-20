import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ApiError, registerUser } from "@/services/auth";
import {
  AtSign,
  Camera,
  CircleAlert,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Captcha, type CaptchaHandle } from "@/components/Captcha";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_AVATAR_MB = 2;
const MAX_BANNER_MB = 5;

/** Arquivo de imagem opcional (null = não enviado), validado por tipo e tamanho. */
function imageSchema(maxMb: number) {
  return z
    .custom<File | null>(
      (value) => value === null || (typeof File !== "undefined" && value instanceof File),
    )
    .refine(
      (file) => file === null || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Use uma imagem PNG, JPG ou WEBP.",
    )
    .refine(
      (file) => file === null || file.size <= maxMb * 1024 * 1024,
      `A imagem deve ter no máximo ${maxMb} MB.`,
    );
}

const registerSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, "O nickname deve ter ao menos 3 caracteres.")
    .max(20, "O nickname deve ter no máximo 20 caracteres.")
    .regex(/^[A-Za-z0-9_.-]+$/, "Use apenas letras, números, ponto, hífen e underline."),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("Digite um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .regex(/[A-Za-z]/, "Inclua ao menos uma letra.")
    .regex(/\d/, "Inclua ao menos um número."),
  captcha: z.string().trim().min(1, "Digite o código da imagem."),
  avatar: imageSchema(MAX_AVATAR_MB),
  banner: imageSchema(MAX_BANNER_MB),
});

type RegisterValues = z.infer<typeof registerSchema>;
type ImageField = "avatar" | "banner";

function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1 text-xs font-medium text-destructive">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/** Cria uma URL temporária para pré-visualizar o arquivo e a libera ao trocar/desmontar. */
function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

function isPreviewable(file: File | null): file is File {
  return file !== null && ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function RegisterPage() {
  const navigate = useNavigate();
  const captchaRef = useRef<CaptchaHandle>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    resetField,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nickname: "",
      email: "",
      password: "",
      captcha: "",
      avatar: null,
      banner: null,
    },
  });

  const avatarFile = watch("avatar");
  const bannerFile = watch("banner");
  const avatarUrl = useObjectUrl(isPreviewable(avatarFile) ? avatarFile : null);
  const bannerUrl = useObjectUrl(isPreviewable(bannerFile) ? bannerFile : null);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Conta criada! Faça login para continuar.");
      navigate({ to: "/login" });
    },
    onError: (error) => {
      const fields = ["nickname", "email", "password", "avatar", "banner"] as const;
      const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
      const matched = fields.filter((field) => fieldErrors[field]);

      if (matched.length > 0) {
        matched.forEach((field) => {
          const message = fieldErrors[field];
          if (message) setError(field, { type: "server", message });
        });
      } else {
        toast.error(error instanceof Error ? error.message : "Não foi possível criar a conta.");
      }
      captchaRef.current?.refresh();
      resetField("captcha");
    },
  });

  const isLoading = mutation.isPending;

  function handleImageChange(field: ImageField, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!file) return;
    setValue(field, file, { shouldValidate: true, shouldDirty: true });
  }

  function removeImage(field: ImageField) {
    setValue(field, null, { shouldValidate: true, shouldDirty: true });
  }

  function onSubmit(values: RegisterValues) {
    // O CAPTCHA é conferido por último, depois que os outros campos são válidos.
    if (!captchaRef.current?.verify(values.captcha)) {
      resetField("captcha");
      setError("captcha", { type: "validate", message: "Código incorreto. Tente o novo código." });
      captchaRef.current?.refresh();
      return;
    }
    mutation.mutate({
      nickname: values.nickname,
      email: values.email,
      password: values.password,
      avatar: values.avatar,
      banner: values.banner,
    });
  }

  // <main> e rodapé já vêm do __root.tsx, por isso aqui é um <div> com flex-1.
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-surface p-6 sm:p-10">
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

      <div className="relative z-10 w-full max-w-[460px]">
        <div className="animate-fade-up relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div aria-hidden="true" className="bg-gradient-brand absolute inset-x-0 top-0 h-1" />

          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="" className="h-6 w-6 object-contain" />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Game<span className="text-primary">Shelf</span>
              </span>
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">Criar conta</h1>
              <p className="text-sm text-muted-foreground">
                Monte seu perfil, use seu e-mail como login e escolha uma senha.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Banner + foto de perfil */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium">
                Perfil <span className="font-normal text-muted-foreground">(opcional)</span>
              </span>

              <div className="relative mb-10">
                <div className="h-28 overflow-hidden rounded-xl border border-border bg-linear-to-br from-primary/25 via-surface to-violet/25">
                  {bannerUrl && (
                    <img
                      src={bannerUrl}
                      alt="Pré-visualização do banner"
                      className="size-full object-cover"
                    />
                  )}
                </div>

                <div className="absolute right-2 top-2 flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => bannerInputRef.current?.click()}
                    className="h-7 gap-1.5 px-2 text-xs"
                  >
                    <ImagePlus className="size-3.5" aria-hidden="true" />
                    {bannerUrl ? "Trocar banner" : "Adicionar banner"}
                  </Button>
                  {bannerFile && (
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      disabled={isLoading}
                      onClick={() => removeImage("banner")}
                      aria-label="Remover banner"
                      className="size-7"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </Button>
                  )}
                </div>

                <div className="absolute -bottom-8 left-4">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => avatarInputRef.current?.click()}
                    aria-label={avatarUrl ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
                    className="group relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Pré-visualização da foto de perfil"
                        className="size-full object-cover"
                      />
                    ) : (
                      <User className="size-8" aria-hidden="true" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Camera className="size-5 text-foreground" aria-hidden="true" />
                    </span>
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => removeImage("avatar")}
                      aria-label="Remover foto de perfil"
                      className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => handleImageChange("avatar", event)}
              />
              <input
                ref={bannerInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => handleImageChange("banner", event)}
              />

              <p className="text-xs text-muted-foreground">
                Foto até {MAX_AVATAR_MB} MB e banner até {MAX_BANNER_MB} MB (PNG, JPG ou WEBP).
              </p>
              <FieldError id="avatar-error" message={errors.avatar?.message} />
              <FieldError id="banner-error" message={errors.banner?.message} />
            </div>

            {/* Nickname */}
            <div className="space-y-1.5">
              <Label htmlFor="nickname">Nickname</Label>
              <div className="relative">
                <AtSign
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="nickname"
                  type="text"
                  autoComplete="nickname"
                  placeholder="seu_nickname"
                  maxLength={20}
                  disabled={isLoading}
                  aria-invalid={!!errors.nickname}
                  aria-describedby="nickname-hint nickname-error"
                  className="pl-9"
                  {...register("nickname")}
                />
              </div>
              <p id="nickname-hint" className="text-xs text-muted-foreground">
                Como você aparece no GameShelf. 3 a 20 caracteres.
              </p>
              <FieldError id="nickname-error" message={errors.nickname?.message} />
            </div>

            {/* Login (e-mail) */}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail (seu login)</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="pl-9"
                  {...register("email")}
                />
              </div>
              <FieldError id="email-error" message={errors.email?.message} />
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-hint password-error"
                  className="px-9"
                  {...register("password")}
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
              <p id="password-hint" className="text-xs text-muted-foreground">
                Pelo menos 8 caracteres, com letras e números.
              </p>
              <FieldError id="password-error" message={errors.password?.message} />
            </div>

            {/* CAPTCHA */}
            <div className="space-y-1.5">
              <Label htmlFor="captcha" className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
                Verificação
              </Label>
              <Captcha ref={captchaRef} disabled={isLoading} />
              <Input
                id="captcha"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={5}
                placeholder="Digite o código da imagem"
                disabled={isLoading}
                aria-invalid={!!errors.captcha}
                aria-describedby={errors.captcha ? "captcha-error" : undefined}
                className="uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                {...register("captcha")}
              />
              <FieldError id="captcha-error" message={errors.captcha?.message} />
            </div>

            <Button type="submit" disabled={isLoading} className="mt-2 w-full gap-2 font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="size-4" aria-hidden="true" />
                  Criar conta
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
