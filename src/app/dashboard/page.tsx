import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  // verifySession() roda dentro de getCurrentUser e redireciona se não autenticado.
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard geral</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Bem-vindo, {user?.name ?? "operador"}.
            </p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost">
              Sair
            </Button>
          </form>
        </header>

        <section className="mt-10 rounded-2xl border border-black/5 bg-white p-8 text-sm text-zinc-600 shadow-sm">
          Fundação concluída. Próximos incrementos: KPIs de fila, faltas,
          capacidade e impacto (RF06).
        </section>
      </div>
    </main>
  );
}
