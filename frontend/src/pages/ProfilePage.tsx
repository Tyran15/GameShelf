import { useMemo, useState } from "react";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileNumbers } from "@/components/profile/ProfileNumbers";
import { RecentCompleted } from "@/components/profile/RecentCompleted";
import { Skeleton } from "@/components/ui/skeleton";
import { useGames } from "@/hooks/useGames";
import { useSession } from "@/hooks/useSession";
import { calculateLibraryStats } from "@/lib/libraryStats";
import {
  buildActivity,
  calculateAchievements,
  getCollectorLevel,
  getRecentlyCompleted,
} from "@/lib/profile";

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export function ProfilePage() {
  const user = useSession().data;
  // Mesma query ({}) da Biblioteca e das Estatísticas: vem do cache do React Query.
  const games = useGames({});
  const [editOpen, setEditOpen] = useState(false);

  const profile = useMemo(() => {
    const list = games.data ?? [];
    const summary = calculateLibraryStats(list);
    return {
      summary,
      level: getCollectorLevel(summary.totalGames),
      achievements: calculateAchievements(list, summary),
      completed: getRecentlyCompleted(list),
      activity: buildActivity(list),
    };
  }, [games.data]);

  if (!user) return null;

  return (
    <div className="page-shell space-y-6">
      <ProfileHeader user={user} level={profile.level} onEdit={() => setEditOpen(true)} />

      {games.isPending ? (
        <ProfileSkeleton />
      ) : games.isError ? (
        <ErrorState error={games.error} onRetry={() => games.refetch()} />
      ) : games.data.length === 0 ? (
        <EmptyState
          title="Seu perfil ainda está vazio"
          description="Cadastre seus primeiros jogos para ver números, conquistas e atividade aqui."
        />
      ) : (
        <>
          <ProfileNumbers summary={profile.summary} />
          <AchievementsSection achievements={profile.achievements} />
          <RecentCompleted games={profile.completed} />
          <ActivityFeed events={profile.activity} />
        </>
      )}

      <EditProfileDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
