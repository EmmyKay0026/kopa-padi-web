export type NyscIntake = {
  id: string;
  serviceYear: string;
  batch: string;
  stream: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  orientationStartDate: string | null;
  orientationEndDate: string | null;
};

export function intakeLabel(intake: Pick<NyscIntake, "serviceYear" | "batch" | "stream">) {
  return `${intake.serviceYear} · ${intake.batch} · ${intake.stream}`;
}

export function activeCatalogIntake(catalog: { intakes: { id: string; serviceYear: string; batch: string; stream: string }[]; activeIntake?: { id: string; serviceYear: string; batch: string; stream: string } | null }) {
  if (catalog.activeIntake !== undefined) return catalog.activeIntake;
  return catalog.intakes.length === 1 ? catalog.intakes[0] : null;
}
