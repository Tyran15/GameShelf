import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  AtSign,
  Camera,
  Check,
  ChevronDown,
  CircleAlert,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SESSION_QUERY_KEY } from "@/hooks/useSession";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_AVATAR_MB,
  MAX_BANNER_MB,
  imageSchema,
  isPreviewable,
} from "@/lib/imageFile";
import { cn } from "@/lib/utils";
import { ApiError, assetUrl, updateProfile, type AuthUser } from "@/services/auth";

/* -------------------------------------------------------------------------- */
/*  Validação (mesmas regras do cadastro e do backend)                         */
/* -------------------------------------------------------------------------- */

const profileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, "O nickname deve ter ao menos 3 caracteres.")
    .max(20, "O nickname deve ter no máximo 20 caracteres.")
    .regex(/^[A-Za-z0-9_.-]+$/, "Use apenas letras, números, ponto, hífen e underline."),
  avatar: imageSchema(MAX_AVATAR_MB),
  banner: imageSchema(MAX_BANNER_MB),
  removeAvatar: z.boolean(),
  removeBanner: z.boolean(),
});

type ProfileValues = z.infer<typeof profileSchema>;
type ImageField = "avatar" | "banner";

/* -------------------------------------------------------------------------- */
/*  Subcomponentes e hooks auxiliares                                          */
/* -------------------------------------------------------------------------- */

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function UnsavedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
      <span className="size-1.5 animate-pulse rounded-full bg-warning" aria-hidden="true" />
      Não salvo
    </span>
  );
}

/** Transforma um elemento em área de soltar arquivo (arrastar e soltar). */
function useDropZone(onFile: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const dropProps = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault(); // sem isso o navegador não aceita o "drop"
      setIsDragging(true);
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      // O dragleave também dispara ao passar por elementos filhos: só desliga ao sair do container.
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) onFile(file);
    },
  };

  return { isDragging, dropProps };
}

/* -------------------------------------------------------------------------- */
/*  Modal                                                                      */
/* -------------------------------------------------------------------------- */

type EditProfileDialogProps = {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProfileDialog({ user, open, onOpenChange }: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-2rem)] max-w-[560px] gap-0 overflow-y-auto rounded-2xl border-border bg-card p-0 shadow-card sm:rounded-2xl">
        <div aria-hidden="true" className="bg-gradient-brand h-1 w-full shrink-0" />
        {/* O formulário só existe com o modal aberto: ao fechar, o rascunho é descartado. */}
        <EditProfileForm user={user} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditProfileForm({ user, onDone }: { user: AuthUser; onDone: () => void }) {
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user.nickname,
      avatar: null,
      banner: null,
      removeAvatar: false,
      removeBanner: false,
    },
  });

  const nickname = watch("nickname");
  const avatarFile = watch("avatar");
  const bannerFile = watch("banner");
  const removeAvatar = watch("removeAvatar");
  const removeBanner = watch("removeBanner");

  // Imagem exibida = arquivo recém-escolhido > imagem atual (se não foi removida) > nada.
  const avatarPreview = useObjectUrl(isPreviewable(avatarFile) ? avatarFile : null);
  const bannerPreview = useObjectUrl(isPreviewable(bannerFile) ? bannerFile : null);
  const avatarSrc = avatarPreview ?? (removeAvatar ? null : assetUrl(user.avatarUrl));
  const bannerSrc = bannerPreview ?? (removeBanner ? null : assetUrl(user.bannerUrl));

  const displayNickname = nickname.trim() || user.nickname;
  const avatarChanged = avatarFile !== null || removeAvatar;
  const bannerChanged = bannerFile !== null || removeBanner;
  const nicknameChanged = nickname.trim() !== user.nickname;
  const hasChanges = avatarChanged || bannerChanged || nicknameChanged;

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      // Atualiza a sessão em cache: o header mostra o novo avatar/nickname na hora.
      queryClient.setQueryData(SESSION_QUERY_KEY, updated);
      toast.success("Perfil atualizado!");
      onDone();
    },
    onError: (error) => {
      const fieldErrors: Record<string, string> =
        error instanceof ApiError ? error.fieldErrors : {};
      let matched = false;
      for (const field of ["nickname", "avatar", "banner"] as const) {
        const message = fieldErrors[field];
        if (message) {
          setError(field, { type: "server", message });
          matched = true;
        }
      }
      if (!matched) {
        toast.error(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
      }
    },
  });

  const isLoading = mutation.isPending;

  function selectImage(field: ImageField, file: File) {
    setValue(field, file, { shouldValidate: true, shouldDirty: true });
    // Escolher um arquivo novo cancela uma remoção marcada antes.
    setValue(field === "avatar" ? "removeAvatar" : "removeBanner", false);
  }

  function removeImage(field: ImageField) {
    setValue(field, null, { shouldValidate: true, shouldDirty: true });
    // Só marca "remover" se existe imagem salva no servidor; senão basta descartar a escolhida.
    const hadSavedImage = field === "avatar" ? user.avatarUrl !== null : user.bannerUrl !== null;
    setValue(field === "avatar" ? "removeAvatar" : "removeBanner", hadSavedImage);
  }

  function handleInputChange(field: ImageField, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (file) selectImage(field, file);
  }

  const avatarDrop = useDropZone((file) => selectImage("avatar", file));
  const bannerDrop = useDropZone((file) => selectImage("banner", file));

  function onSubmit(values: ProfileValues) {
    mutation.mutate({
      nickname: values.nickname,
      avatar: values.avatar,
      banner: values.banner,
      removeAvatar: values.removeAvatar,
      removeBanner: values.removeBanner,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col">
      <DialogHeader className="px-6 pb-4 pr-12 pt-5 text-left">
        <DialogTitle className="text-xl font-bold">Editar perfil</DialogTitle>
        <DialogDescription>Atualize sua foto, seu banner e seu apelido.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5 px-6 pb-6">
        {/* ----- Banner + foto: o próprio cabeçalho do perfil é a pré-visualização ----- */}
        <div className="space-y-2">
          <div>
            <div
              {...bannerDrop.dropProps}
              className={cn(
                "relative h-32 overflow-hidden rounded-xl border bg-linear-to-br from-primary/25 via-surface to-violet/25 transition-colors",
                bannerDrop.isDragging ? "border-2 border-dashed border-primary" : "border-border",
              )}
            >
              {bannerSrc && (
                <img src={bannerSrc} alt="Banner do perfil" className="size-full object-cover" />
              )}

              {/* Banner vazio: a área inteira vira um botão "arraste ou clique" */}
              {!bannerSrc && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => bannerInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  <ImagePlus className="size-6 text-primary" aria-hidden="true" />
                  Arraste uma imagem ou clique para escolher
                </button>
              )}

              {bannerDrop.isDragging && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/75 text-sm font-semibold text-primary backdrop-blur-sm">
                  <UploadCloud className="size-5" aria-hidden="true" />
                  Solte a imagem aqui
                </div>
              )}

              <div className="absolute right-2 top-2 flex gap-1.5">
                {bannerSrc && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => bannerInputRef.current?.click()}
                    className="h-7 gap-1.5 px-2 text-xs"
                  >
                    <Camera className="size-3.5" aria-hidden="true" />
                    Trocar banner
                  </Button>
                )}
                {bannerSrc && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => removeImage("banner")}
                    aria-label="Remover banner"
                    className="size-7"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                )}
              </div>

              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                {bannerChanged && <UnsavedBadge />}
              </div>
              <span className="absolute bottom-2 right-2 rounded border border-border bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                PNG, JPG ou WEBP · até {MAX_BANNER_MB} MB
              </span>
            </div>

            {/* Avatar sobreposto ao banner + ações da foto */}
            <div className="relative -mt-10 flex flex-wrap items-end justify-between gap-x-3 gap-y-2 px-3">
              <div {...avatarDrop.dropProps} className="relative shrink-0">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label={avatarSrc ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
                  className={cn(
                    "group relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 bg-muted text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    avatarDrop.isDragging ? "border-dashed border-primary" : "border-card",
                  )}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Foto de perfil" className="size-full object-cover" />
                  ) : (
                    <User className="size-8" aria-hidden="true" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Camera className="size-5 text-foreground" aria-hidden="true" />
                  </span>
                </button>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground"
                >
                  <Camera className="size-3" />
                </span>
              </div>

              <div className="flex min-w-0 flex-col items-end gap-1 pb-1">
                {avatarChanged && <UnsavedBadge />}
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Camera className="size-3.5 text-primary" aria-hidden="true" />
                    Trocar foto
                  </Button>
                  {avatarSrc && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isLoading}
                      onClick={() => removeImage("avatar")}
                      className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                      Remover
                    </Button>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  PNG, JPG ou WEBP · até {MAX_AVATAR_MB} MB
                </span>
              </div>
            </div>

            {/* Apelido ao vivo, como aparecerá no perfil */}
            <p className="mt-2 truncate px-3 font-display text-base font-bold tracking-tight">
              {displayNickname}
            </p>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => handleInputChange("avatar", event)}
          />
          <input
            ref={bannerInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => handleInputChange("banner", event)}
          />

          <FieldError message={errors.avatar?.message} />
          <FieldError message={errors.banner?.message} />
        </div>

        {/* ----- Apelido ----- */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-nickname">Apelido</Label>
            {nicknameChanged && <UnsavedBadge />}
          </div>
          <div className="relative">
            <AtSign
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="profile-nickname"
              type="text"
              autoComplete="nickname"
              maxLength={20}
              disabled={isLoading}
              aria-invalid={!!errors.nickname}
              aria-describedby="profile-nickname-hint profile-nickname-error"
              className="px-9 pr-14"
              {...register("nickname")}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
              {nickname.length}/20
            </span>
          </div>
          <p id="profile-nickname-hint" className="text-xs text-muted-foreground">
            3 a 20 caracteres. Letras, números, ponto, hífen e underline.
          </p>
          <div id="profile-nickname-error">
            <FieldError message={errors.nickname?.message} />
          </div>
        </div>

        {/* ----- Prévia no menu superior ----- */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Como aparece no menu superior</span>
          <div className="flex items-center gap-2 rounded-md px-2 py-1">
            <Avatar className="size-7">
              {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
              <AvatarFallback>
                <User className="size-4 text-muted-foreground" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <span className="max-w-28 truncate text-sm font-medium">{displayNickname}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 border-t border-border bg-surface px-6 py-4 sm:space-x-0">
        <Button type="button" variant="outline" disabled={isLoading} onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!hasChanges || isLoading} className="gap-2 font-semibold">
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="size-4" aria-hidden="true" />
              Salvar alterações
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
