import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Seed de demonstração: cria uma organização com dados fictícios realistas
 * (unidades, pacientes, fila, agenda, faltas) para que todos os painéis
 * apareçam preenchidos sem precisar importar planilha.
 *
 * Idempotente: apaga a organização demo (cascata) e recria do zero.
 *
 *   Gestor:   gestor@pulsoviva.com.br   / PulsoViva@2026
 *   Operador: operador@pulsoviva.com.br / PulsoViva@2026
 */

const ORG_NAME = "Clínica Demonstração";

const UNITS = [
  { name: "UBS Centro", city: "São Paulo", uf: "SP", type: "Atenção primária" },
  { name: "UBS Jardim", city: "São Paulo", uf: "SP", type: "Atenção primária" },
  { name: "UPA Norte", city: "São Paulo", uf: "SP", type: "Urgência" },
  { name: "Policlínica Leste", city: "São Paulo", uf: "SP", type: "Especialidades" },
  { name: "UBS Vila Nova", city: "Guarulhos", uf: "SP", type: "Atenção primária" },
];

const SPECIALTIES = [
  { name: "Cardiologia", procedures: ["Consulta", "Eletrocardiograma", "Ecocardiograma"] },
  { name: "Dermatologia", procedures: ["Consulta", "Biópsia de pele"] },
  { name: "Ortopedia", procedures: ["Consulta", "Raio-X", "Infiltração"] },
  { name: "Pediatria", procedures: ["Consulta", "Puericultura"] },
  { name: "Psicologia", procedures: ["Sessão", "Avaliação"] },
  { name: "Psiquiatria", procedures: ["Consulta", "Retorno"] },
  { name: "Ginecologia", procedures: ["Consulta", "Ultrassom", "Preventivo"] },
  { name: "Oftalmologia", procedures: ["Consulta", "Mapeamento de retina"] },
  { name: "Nutrição", procedures: ["Consulta", "Reavaliação"] },
  { name: "Fisioterapia", procedures: ["Sessão", "Avaliação"] },
];

const FIRST_NAMES = [
  "Maria", "José", "Ana", "João", "Antônio", "Francisca", "Carlos", "Paulo",
  "Pedro", "Lucas", "Luiz", "Marcos", "Luís", "Gabriel", "Rafael", "Daniel",
  "Marcelo", "Bruno", "Eduardo", "Felipe", "Raimundo", "Rodrigo", "Manoel",
  "Sandra", "Patrícia", "Aline", "Sônia", "Fernanda", "Juliana", "Márcia",
  "Adriana", "Camila", "Beatriz", "Larissa", "Vanessa", "Letícia", "Cláudia",
];

const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
  "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
  "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
  "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado",
];

const PROFESSIONALS = [
  "Dra. Renata Alves", "Dr. Marcelo Tavares", "Dra. Beatriz Lima",
  "Dr. Henrique Souza", "Dra. Patrícia Gomes", "Dr. Otávio Ramos",
];

const PRIORITIES = ["urgente", "alta", "normal", "normal", "normal", "baixa"];

const STATUSES = [
  "scheduled", "scheduled", "scheduled", "confirmed", "confirmed",
  "attended", "attended", "no_show", "cancelled", "rescheduled",
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(randInt(7, 17), pick([0, 15, 30, 45]), 0, 0);
  return d;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  // Idempotência: remove a org demo (cascata limpa todo o resto).
  const existing = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.name, ORG_NAME));
  for (const org of existing) {
    await db
      .delete(schema.organizations)
      .where(eq(schema.organizations.id, org.id));
  }

  // Organização
  const [org] = await db
    .insert(schema.organizations)
    .values({ name: ORG_NAME, type: "clínica", status: "trial" })
    .returning();
  const orgId = org.id;

  // Usuários
  const passwordHash = await bcrypt.hash("PulsoViva@2026", 10);
  await db.insert(schema.users).values([
    {
      organizationId: orgId,
      name: "Dra. Renata Alves",
      email: "gestor@pulsoviva.com.br",
      passwordHash,
      role: "org_manager",
    },
    {
      organizationId: orgId,
      name: "Carlos Operador",
      email: "operador@pulsoviva.com.br",
      passwordHash,
      role: "operator",
    },
  ]);

  // Unidades
  const insertedUnits = await db
    .insert(schema.units)
    .values(UNITS.map((u) => ({ organizationId: orgId, ...u })))
    .returning({ id: schema.units.id });

  // Pacientes + fila + agenda + eventos
  const PATIENT_COUNT = 90;
  let patientsCreated = 0;
  let requestsCreated = 0;
  let appointmentsCreated = 0;
  let eventsCreated = 0;

  for (let i = 0; i < PATIENT_COUNT; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    // ~15% sem contato (para alimentar a tela de Qualidade de dados).
    const hasContact = Math.random() > 0.15;
    const contact = hasContact
      ? `(11) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`
      : null;

    const [patient] = await db
      .insert(schema.patients)
      .values({
        organizationId: orgId,
        externalId: Math.random() > 0.2 ? `EXT-${10000 + i}` : null,
        name,
        contact,
        age: randInt(1, 92),
      })
      .returning({ id: schema.patients.id });
    patientsCreated++;

    const specialty = pick(SPECIALTIES);
    // Espera: maioria recente, ~20% antiga (gera "parados" e espera longa).
    const waitDays = Math.random() > 0.8 ? randInt(95, 200) : randInt(1, 80);
    const requestedAt = daysFromNow(-waitDays);

    const [req] = await db
      .insert(schema.accessRequests)
      .values({
        organizationId: orgId,
        patientId: patient.id,
        specialty: specialty.name,
        procedure: pick(specialty.procedures),
        requestedAt,
        priority: pick(PRIORITIES),
        origin: "seed",
      })
      .returning({ id: schema.accessRequests.id });
    requestsCreated++;

    // ~85% dos pedidos têm agendamento.
    if (Math.random() > 0.15) {
      const status = pick(STATUSES);
      // Atendidos/faltas no passado; agendados/confirmados no futuro próximo.
      const past = status === "attended" || status === "no_show" || status === "cancelled";
      const scheduledAt = past ? daysFromNow(-randInt(1, 28)) : daysFromNow(randInt(1, 21));

      await db.insert(schema.appointments).values({
        organizationId: orgId,
        requestId: req.id,
        unitId: pick(insertedUnits).id,
        scheduledAt,
        professional: pick(PROFESSIONALS),
        status,
      });
      appointmentsCreated++;

      // Eventos de comparecimento para alimentar histórico/risco.
      if (status === "no_show" || status === "attended" || status === "cancelled") {
        await db.insert(schema.attendanceEvents).values({
          organizationId: orgId,
          patientId: patient.id,
          type:
            status === "no_show"
              ? "no_show"
              : status === "cancelled"
                ? "cancellation"
                : "attended",
          occurredAt: scheduledAt,
          status,
        });
        eventsCreated++;
      }
    }
  }

  console.log("Seed de demonstração concluído:");
  console.log(`  organização: ${ORG_NAME}`);
  console.log(`  unidades: ${insertedUnits.length}`);
  console.log(`  pacientes: ${patientsCreated}`);
  console.log(`  solicitações (fila): ${requestsCreated}`);
  console.log(`  agendamentos: ${appointmentsCreated}`);
  console.log(`  eventos de comparecimento: ${eventsCreated}`);
  console.log("");
  console.log("Login: gestor@pulsoviva.com.br / PulsoViva@2026");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
