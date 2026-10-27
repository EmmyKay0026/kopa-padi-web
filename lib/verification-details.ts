export type VerificationDetails = {
  dateOfBirth: string;
  matriculationNumber: string;
};

export function formatDateOfBirth(value?: string | null) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
