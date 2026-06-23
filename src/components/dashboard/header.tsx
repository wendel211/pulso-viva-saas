import { UserMenu } from "@/components/dashboard/user-menu";
import { getUserActivity } from "@/lib/queries/user-activity";

type DashboardHeaderProps = {
  userName: string;
  userRoleLabel: string;
  userEmail: string;
};

function formatLastLogin(date: Date | null): string {
  if (!date) return "Primeiro acesso";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Topbar do painel — paleta clara e suave, distinta da sidebar navy.
 * Mostra apenas o avatar + nome do gestor; o clique abre o menu com
 * e-mail e atividade de login.
 */
export async function DashboardHeader({
  userName,
  userRoleLabel,
  userEmail,
}: DashboardHeaderProps) {
  const activity = await getUserActivity();

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-end border-b border-slate-200/70 bg-white/85 px-8 backdrop-blur-md">
      <UserMenu
        userName={userName}
        userEmail={userEmail}
        roleLabel={userRoleLabel}
        lastLoginText={formatLastLogin(activity.lastLoginAt)}
      />
    </header>
  );
}
