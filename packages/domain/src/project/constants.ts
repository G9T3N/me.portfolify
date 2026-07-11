export const PROJECT_STATUSES = ["draft", "published", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
