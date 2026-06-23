import { getCurrentUser } from "@/lib/dal";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

const ROLE_LABELS: Record<string, string> = {
  admin_pulsoviva: "Administrador PulsoViva",
  org_manager: "Gestor da organização",
  operator: "Operador de acesso",
  analyst: "Analista/coordenação",
  dpo_auditor: "DPO/Auditor",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getCurrentUser() chama verifySession() e redireciona se não autenticado.
  const user = await getCurrentUser();

  const roleLabel = ROLE_LABELS[user?.role ?? ""] ?? "Operador de acesso";

  return (
    <div className="flex min-h-screen w-full bg-[#eef2f7] text-[#0f1b2a]">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          userName={user?.name ?? "Usuário"}
          userRoleLabel={roleLabel}
          userEmail={user?.email}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
