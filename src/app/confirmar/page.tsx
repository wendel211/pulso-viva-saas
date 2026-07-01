import { CalendarClock, MapPin, Stethoscope, UserRound } from "lucide-react";

import { verifyConfirmToken } from "@/lib/confirm/token";
import { getAppointmentForConfirm } from "@/lib/queries/confirm";
import { ConfirmActions } from "@/components/confirm-actions";
import { BrandMark } from "@/components/brand-mark";

function InfoLine({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-700">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e6fbf8] text-[#0a9f93]">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const token = t ?? "";
  const payload = token ? await verifyConfirmToken(token) : null;
  const appointment = payload
    ? await getAppointmentForConfirm(payload.appointmentId, payload.organizationId)
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f7] px-5 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 rounded-2xl bg-[#071220] px-6 py-6">
          <BrandMark compact />
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.09)]">
          {!appointment ? (
            <div className="text-center">
              <h1 className="text-lg font-semibold text-zinc-900">
                Link inválido
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Este link de confirmação é inválido ou expirou. Entre em contato
                com a unidade de saúde.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-zinc-950">
                Confirmação de consulta
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                {appointment.patientName
                  ? `Olá, ${appointment.patientName.split(" ")[0]}.`
                  : "Olá."}{" "}
                Você pode confirmar ou cancelar sua consulta abaixo.
              </p>

              <div className="mt-6 space-y-3 rounded-xl bg-[#f7fafc] p-4">
                <InfoLine icon={<Stethoscope className="size-4" aria-hidden="true" />}>
                  {appointment.specialty ?? "Consulta"}
                </InfoLine>
                <InfoLine icon={<CalendarClock className="size-4" aria-hidden="true" />}>
                  {appointment.scheduledAt
                    ? new Date(appointment.scheduledAt).toLocaleString("pt-BR", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })
                    : "Data a confirmar"}
                </InfoLine>
                {appointment.unitName ? (
                  <InfoLine icon={<MapPin className="size-4" aria-hidden="true" />}>
                    {appointment.unitName}
                  </InfoLine>
                ) : null}
                {appointment.professional ? (
                  <InfoLine icon={<UserRound className="size-4" aria-hidden="true" />}>
                    {appointment.professional}
                  </InfoLine>
                ) : null}
              </div>

              <div className="mt-6">
                <ConfirmActions token={token} initialStatus={appointment.status} />
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          PulsoViva · Inteligência de acesso em saúde
        </p>
      </div>
    </main>
  );
}
