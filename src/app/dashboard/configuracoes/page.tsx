import { getCurrentUser } from "@/lib/dal";
import { getRankingWeights, getOrgProfile } from "@/lib/queries/settings";
import { RankingWeightsForm } from "@/components/ranking-weights-form";
import { OrgProfileForm } from "@/components/org-profile-form";

export default async function SettingsPage() {
  const [user, weights, profile] = await Promise.all([
    getCurrentUser(),
    getRankingWeights(),
    getOrgProfile(),
  ]);

  const canEdit =
    user?.role === "org_manager" || user?.role === "admin_pulsoviva";

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ajuste o comportamento da inteligência de acesso da sua organização.
        </p>

        <section className="mt-8 rounded-[20px] border border-[#eaeff5] bg-white p-7 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <h2 className="text-base font-bold text-zinc-900">
            Perfil da organização
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Define o enquadramento das métricas e a linguagem do produto. A
            inteligência por baixo é a mesma; muda a lente de valor.
          </p>

          <div className="mt-6">
            {canEdit ? (
              <OrgProfileForm
                segment={profile.segment}
                slotValueReais={profile.slotValueCents / 100}
              />
            ) : (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Apenas gestores podem alterar o perfil da organização.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[20px] border border-[#eaeff5] bg-white p-7 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <h2 className="text-base font-bold text-zinc-900">
            Pesos do ranking de encaixe
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Defina o quanto cada critério influencia a ordenação dos candidatos
            a uma vaga ociosa (RF17).
          </p>

          <div className="mt-6">
            {canEdit ? (
              <RankingWeightsForm weights={weights} />
            ) : (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Apenas gestores podem editar os pesos. Os valores atuais estão
                aplicados ao ranking.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
