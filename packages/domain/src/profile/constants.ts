export const AVAILABILITY_STATUSES = ["available", "unavailable", "part-time"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];
