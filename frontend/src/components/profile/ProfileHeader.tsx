import { Calendar, Medal, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatMemberSince } from "@/lib/profile";
import { assetUrl, type AuthUser } from "@/services/auth";

/** Banner enviado pelo usuário ou, na falta dele, uma grade decorativa nas cores do tema. */
function Banner({ url }: { url: string | null }) {
  if (url) {
    return (
      <div className="relative h-44 w-full overflow-hidden bg-secondary sm:h-56">
        <img src={url} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-background via-surface to-accent sm:h-56">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full text-primary opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="profile-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="profile-glow" cx="80%" cy="20%" r="60%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#profile-grid)" />
        <rect width="100%" height="100%" fill="url(#profile-glow)" />
      </svg>
    </div>
  );
}

export function ProfileHeader({
  user,
  level,
  onEdit,
}: {
  user: AuthUser;
  level: number;
  onEdit: () => void;
}) {
  const avatarSrc = assetUrl(user.avatarUrl);
  const initials = user.nickname.slice(0, 3).toUpperCase();

  return (
    <section className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <Banner url={assetUrl(user.bannerUrl)} />

      <div className="relative px-4 pb-6 sm:px-8">
        <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Anel em degradê da marca ao redor do avatar */}
            <div className="size-28 shrink-0 rounded-full bg-gradient-brand p-1 shadow-glow sm:size-32">
              <Avatar className="size-full border-4 border-card">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={`Foto de ${user.nickname}`} />}
                <AvatarFallback className="bg-surface font-display text-3xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">{user.nickname}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <Medal className="size-3.5" aria-hidden="true" />
                  Colecionador nível {level}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4" aria-hidden="true" />
                Membro desde {formatMemberSince(user.createdAt)}
              </p>
            </div>
          </div>

          <Button variant="secondary" onClick={onEdit} className="w-full gap-2 sm:w-auto">
            <Pencil className="size-4" aria-hidden="true" />
            Editar perfil
          </Button>
        </div>
      </div>
    </section>
  );
}
