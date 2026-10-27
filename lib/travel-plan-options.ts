export const DEPARTURE_WINDOWS = [
  "EARLY_MORNING", "MORNING", "LATE_MORNING", "AFTERNOON", "FLEXIBLE",
] as const;

export const DEPARTURE_WINDOW_OPTIONS = [
  ["EARLY_MORNING", "Early Morning", "4 AM – 7 AM"],
  ["MORNING", "Morning", "7 AM – 10 AM"],
  ["LATE_MORNING", "Late Morning", "10 AM – 12 PM"],
  ["AFTERNOON", "Afternoon", "12 PM – 4 PM"],
  ["FLEXIBLE", "Flexible", ""],
] as const;

export const TRANSPORT_MODES = [
  "COMMERCIAL_BUS", "TRAIN", "FLIGHT", "PRIVATE_VEHICLE", "UNDECIDED",
] as const;

export const TRANSPORT_MODE_OPTIONS = [
  ["COMMERCIAL_BUS", "Commercial Bus", "bus"],
  ["TRAIN", "Train", "train"],
  ["FLIGHT", "Flight", "plane"],
  ["PRIVATE_VEHICLE", "Private Vehicle", "car"],
  ["UNDECIDED", "Not Decided Yet", "clock"],
] as const;
