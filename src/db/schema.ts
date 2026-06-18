import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

/**
 * Modelo de dados conceitual da PulsoViva Acesso (doc §9).
 *
 * Princípios:
 * - Multi-tenancy lógico: toda tabela operacional carrega `organizationId`
 *   e DEVE ser filtrada por ele em qualquer query (RNF de escalabilidade).
 * - Minimização de dados pessoais (LGPD): usar `externalId` pseudonimizado
 *   sempre que possível; evitar dados clínicos detalhados.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", [
  "admin_pulsoviva", // Administrador PulsoViva
  "org_manager", // Gestor da organização
  "operator", // Operador de acesso
  "analyst", // Analista/coordenação
  "dpo_auditor", // DPO/Auditor
]);

export const orgStatusEnum = pgEnum("org_status", [
  "active",
  "suspended",
  "trial",
]);

export const importStatusEnum = pgEnum("import_status", [
  "pending",
  "processing",
  "validated",
  "failed",
  "completed",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "rescheduled",
  "attended",
  "no_show",
  "cancelled",
]);

export const attendanceEventTypeEnum = pgEnum("attendance_event_type", [
  "no_show",
  "attended",
  "cancellation",
  "confirmation",
  "reschedule",
  "withdrawal",
]);

export const riskBandEnum = pgEnum("risk_band", ["low", "medium", "high"]);

export const actionTaskStatusEnum = pgEnum("action_task_status", [
  "pending",
  "contacted",
  "confirmed",
  "rescheduled",
  "fitted", // encaixado
  "refused", // recusou
  "not_found", // não localizado
]);

// ---------------------------------------------------------------------------
// Tabelas
// ---------------------------------------------------------------------------

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type"), // clínica, rede de exames, ambulatório, município...
  cnpj: text("cnpj"),
  plan: text("plan").default("pilot"),
  status: orgStatusEnum("status").notNull().default("trial"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("operator"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_org_idx").on(t.organizationId)],
);

export const units = pgTable(
  "units",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    city: text("city"),
    uf: text("uf"),
    type: text("type"), // UBS, clínica, centro de exame, ambulatório
  },
  (t) => [index("units_org_idx").on(t.organizationId)],
);

export const importBatches = pgTable(
  "import_batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    status: importStatusEnum("status").notNull().default("pending"),
    rowCount: integer("row_count").default(0),
    errors: jsonb("errors").$type<Array<{ row: number; field: string; message: string }>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("import_batches_org_idx").on(t.organizationId)],
);

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    externalId: text("external_id"), // pseudonimização (LGPD)
    name: text("name"),
    contact: text("contact"),
    age: integer("age"),
  },
  (t) => [index("patients_org_idx").on(t.organizationId)],
);

export const accessRequests = pgTable(
  "access_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    specialty: text("specialty"),
    procedure: text("procedure"),
    requestedAt: timestamp("requested_at", { withTimezone: true }),
    priority: text("priority"),
    origin: text("origin"),
  },
  (t) => [index("access_requests_org_idx").on(t.organizationId)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    requestId: uuid("request_id").references(() => accessRequests.id, {
      onDelete: "set null",
    }),
    unitId: uuid("unit_id").references(() => units.id, { onDelete: "set null" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    professional: text("professional"),
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
  },
  (t) => [index("appointments_org_idx").on(t.organizationId)],
);

export const attendanceEvents = pgTable(
  "attendance_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id").references(() => patients.id, {
      onDelete: "cascade",
    }),
    type: attendanceEventTypeEnum("type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }),
    status: text("status"),
  },
  (t) => [index("attendance_events_org_idx").on(t.organizationId)],
);

export const riskScores = pgTable(
  "risk_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(), // appointment | patient | queue
    targetId: uuid("target_id").notNull(),
    score: integer("score").notNull(), // 0-100
    band: riskBandEnum("band").notNull(),
    factors: jsonb("factors").$type<Array<{ name: string; weight: number }>>(),
    modelVersion: text("model_version").notNull().default("baseline-v1"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("risk_scores_org_idx").on(t.organizationId)],
);

export const actionTasks = pgTable(
  "action_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // confirmação | encaixe | atualização cadastral
    patientId: uuid("patient_id").references(() => patients.id, {
      onDelete: "cascade",
    }),
    recommendation: text("recommendation"),
    status: actionTaskStatusEnum("status").notNull().default("pending"),
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("action_tasks_org_idx").on(t.organizationId)],
);

export const impactMetrics = pgTable(
  "impact_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // ex.: 2026-06
    recoveredSlots: integer("recovered_slots").default(0),
    avoidedNoShows: integer("avoided_no_shows").default(0),
    preservedCost: integer("preserved_cost").default(0), // em centavos
  },
  (t) => [index("impact_metrics_org_idx").on(t.organizationId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(), // login | import | export | status_change
    resource: text("resource"),
    ip: text("ip"),
    metadata: jsonb("metadata"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_logs_org_idx").on(t.organizationId)],
);

// Sessões em banco (auth — doc RF01). Cookie guarda apenas o ID cifrado.
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
